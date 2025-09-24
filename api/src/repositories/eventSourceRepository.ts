import { UUID } from "crypto";
import { Pool, PoolClient, PoolConfig } from "pg";
import {
  EventType,
  Event,
  ListingCreatedEventData,
  ImagesUploadedEventData,
  ListingUpdatedEventData,
  ListingPurchasedEventData,
  EventData,
} from "../types";

export interface EventSourceRepository {
  insertEvent: (eventType: EventType, eventData: EventData) => Promise<UUID>;
  insertEventByStreamId: (
    streamId: UUID,
    eventType: EventType,
    eventData: EventData
  ) => Promise<void>;
  getEventsFromPosition: (position: number) => Promise<Event[]>;
}

export const EventSourceRepository = (env: any): EventSourceRepository => {
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

  const getEventsFromPosition = async (position: number): Promise<Event[]> => {
    const dbClient = await pool.connect();
    try {
      const results = await dbClient.query(
        "SELECT * FROM event_store.events WHERE position > $1",
        [position]
      );

      const events = results.rows.map(mapEvent);
      return events;
    } catch (error) {
      throw error;
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
    insertEventByStreamId,
    getEventsFromPosition,
  };
};
