import { Logger } from "winston";
import { UUID } from "crypto";
import { Pool, PoolConfig } from "pg";
import { EventType, Event, EventData } from "../types";

interface EventSourceTableRow {
  position: number;
  created_at: Date;
  listing_id: UUID;
  version: number;
  event_type: EventType;
  data: EventData;
  metadata: any;
}

export interface EventSourceRepository {
  insertEvent: (eventType: EventType, data: EventData) => Promise<UUID>;
  insertEventByID: (
    listingId: UUID,
    eventType: EventType,
    data: EventData
  ) => Promise<void>;
  getEvents: (position: number) => Promise<Event[]>;
}

export const EventSourceRepository = (
  logger: Logger,
  env: any
): EventSourceRepository => {
  const dbConfig: PoolConfig = {
    ...env,
  };

  const pool = new Pool(dbConfig);

  const insertEvent = async (event_type: EventType, data: EventData = {}) => {
    const dbClient = await pool.connect();
    try {
      const result = await dbClient.query(
        "INSERT INTO event_store.events (event_type, data) VALUES ($1, $2) RETURNING listing_id;",
        [event_type, data]
      );
      return result.rows[0] && (result.rows[0].listing_id as UUID);
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const insertEventByID = async (
    listingID: UUID,
    eventType: EventType,
    data: EventData
  ) => {
    const dbClient = await pool.connect();
    try {
      const version = await dbClient.query(
        "SELECT MAX(version) FROM event_store.events WHERE listing_id = $1",
        [listingID]
      );
      if (version.rows[0].max === null) {
        throw new Error("listing id not found");
      }
      await dbClient.query(
        "INSERT INTO event_store.events (listing_id, version, event_type, data) VALUES ($1, $2, $3, $4)",
        [listingID, version.rows[0].max + 1, eventType, data]
      );
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const getEvents = async (position: number): Promise<Event[]> => {
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

  const mapEvent = (row: EventSourceTableRow): Event => ({
    position: row.position,
    listingId: row.listing_id,
    version: row.version,
    createdAt: row.created_at,
    eventType: row.event_type,
    data: row.data,
    metadata: row.metadata,
  });
  return {
    insertEvent,
    insertEventByID,
    getEvents,
  };
};
