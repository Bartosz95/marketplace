import { UUID } from "crypto";
import { Pool, PoolConfig } from "pg";
import { EventType, Event, EventData } from "../types";
import { EnvDB } from "../libs/validationSchemas";

export interface EventSourceRepository {
  insertEvent: (eventType: EventType, eventData: EventData) => Promise<UUID>;
  ensureUserFirstRequest: (
    authenticationProviderId: string,
    eventData: EventData,
  ) => Promise<void>;
  insertEventByStreamId: (
    streamId: UUID,
    eventType: EventType,
    eventData: EventData
  ) => Promise<void>;
  getEventsFromPosition: (
    position: number,
    eventsNumber: number
  ) => Promise<Event[]>;
  getEventByCheckoutSessionId: (checkoutSessionId: string) => Promise<Event | undefined>;
  getLatestEventInStream: (streamId: UUID, eventType: EventType) => Promise<Event | undefined>;
}

export const EventSourceRepository = (env: EnvDB): EventSourceRepository => {
  const dbConfig: PoolConfig = {
    ...env,
  };

  const pool = new Pool(dbConfig);

  const insertEvent = async (eventType: EventType, data: EventData) => {
    const dbClient = await pool.connect();
    try {
      const result = await dbClient.query(
        "INSERT INTO event_store.events (event_type, data) VALUES ($1, $2) RETURNING stream_id;",
        [eventType, data]
      );
      const { stream_id } = result.rows[0];
      return stream_id;
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const ensureUserFirstRequest = async (
    authenticationProviderId: string,
    data: EventData,
  ) => {
    const dbClient = await pool.connect();
    try {
      await dbClient.query("BEGIN");
      await dbClient.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
        authenticationProviderId,
      ]);
      const existing = await dbClient.query(
        `SELECT 1
        FROM event_store.events
        WHERE event_type = $1 AND data->>'authenticationProviderId' = $2
        LIMIT 1`,
        [EventType.USER_FIRST_REQUEST, authenticationProviderId],
      );
      if (existing.rowCount === 0) {
        await dbClient.query(
          "INSERT INTO event_store.events (event_type, data) VALUES ($1, $2)",
          [EventType.USER_FIRST_REQUEST, data],
        );
      }
      await dbClient.query("COMMIT");
    } catch (error) {
      await dbClient.query("ROLLBACK");
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const insertEventByStreamId = async (
    streamId: UUID,
    eventType: EventType,
    data: EventData
  ) => {
    const dbClient = await pool.connect();
    try {
      await dbClient.query(
        `WITH max_version AS (
          SELECT COALESCE(MAX(version), 0) AS v 
          FROM event_store.events 
          WHERE stream_id = $1
          )
        INSERT INTO event_store.events (stream_id, event_type, data, version)
        SELECT $1, $2, $3, v + 1
        FROM max_version`,
        [streamId, eventType, data]
      );
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const getEventsFromPosition = async (
    startPosition: number,
    eventsNumber: number
  ): Promise<Event[]> => {
    const dbClient = await pool.connect();
    try {
      const endPosition = startPosition + eventsNumber;
      const results = await dbClient.query(
        "SELECT * FROM event_store.events WHERE position BETWEEN $1 AND $2;",
        [startPosition, endPosition]
      );

      const events = results.rows.map(mapEvent);
      return events;
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const getEventByCheckoutSessionId = async (checkoutSessionId: string) => {
    const dbClient = await pool.connect();
    try {
      const result = await dbClient.query(
        "SELECT * FROM event_store.events WHERE data->>'checkoutSessionId' = $1 LIMIT 1",
        [checkoutSessionId],
      );
      return result.rowCount ? mapEvent(result.rows[0]) : undefined;
    } finally {
      dbClient.release();
    }
  };

  const getLatestEventInStream = async (streamId: UUID, eventType: EventType) => {
    const dbClient = await pool.connect();
    try {
      const result = await dbClient.query(
        "SELECT * FROM event_store.events WHERE stream_id = $1 AND event_type = $2 ORDER BY version DESC LIMIT 1",
        [streamId, eventType],
      );
      return result.rowCount ? mapEvent(result.rows[0]) : undefined;
    } finally {
      dbClient.release();
    }
  };

  const mapEvent = (row: any): Event => ({
    position: row.position,
    streamId: row.stream_id,
    version: row.version,
    createdAt: row.created_at,
    eventType: row.event_type,
    data: row.data,
    metadata: row.metadata,
  });
  return {
    insertEvent,
    ensureUserFirstRequest,
    insertEventByStreamId,
    getEventsFromPosition,
    getEventByCheckoutSessionId,
    getLatestEventInStream,
  };
};
