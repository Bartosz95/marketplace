import { Logger } from "winston";
import { UUID } from "crypto";
import { Pool, PoolConfig } from "pg";
import { EventType, Event } from "../types";

export interface EventSourceRepository {
  insertEvent: (event: Event) => Promise<UUID>;
  getEventsFromPosition: (position: number) => Promise<Event[]>;
}

export const EventSourceRepository = (env: any): EventSourceRepository => {
  const dbConfig: PoolConfig = {
    ...env,
  };

  const pool = new Pool(dbConfig);

  const insertEvent = async (event: Event) => {
    const { eventType, listingId, data } = event;
    const dbClient = await pool.connect();
    try {
      const versionResult = await dbClient.query(
        "SELECT MAX(version) FROM event_store.events WHERE listing_id = $1",
        [listingId]
      );
      const version = versionResult.rows[0].max;
      if (!version) {
        const result = await dbClient.query(
          "INSERT INTO event_store.events (event_type, data) VALUES ($1, $2) RETURNING listing_id;",
          [eventType, data]
        );
        return result.rows[0] && (result.rows[0].listing_id as UUID);
      } else {
        await dbClient.query(
          "INSERT INTO event_store.events (listing_id, version, event_type, data) VALUES ($1, $2, $3, $4)",
          [listingId, version + 1, eventType, data]
        );
      }
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
    listingId: row.listing_id,
    version: row.version,
    createdAt: row.created_at,
    eventType: row.event_type,
    data: row.data,
    metadata: row.metadata,
  });
  return {
    insertEvent,
    getEventsFromPosition,
  };
};
