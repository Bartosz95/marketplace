import { Logger } from "winston";
import { UUID } from "crypto";
import { Pool, PoolConfig } from "pg";
import { EventType, Event } from "../types";

export interface ListingsRepository {
  insertEvent: (event_type: EventType, data: any) => Promise<void>;
  getEvents: (limit?: number, returnDeleted?: boolean) => Promise<Event[]>;
  insertEventByID: (
    listing_id: UUID,
    eventType: EventType,
    data?: any
  ) => Promise<void>;
  getEventsByID: (listing_id: UUID) => Promise<Event[]>;
}

export const listingsRepository = (logger: Logger, env: any) => {
  const dbConfig: PoolConfig = {
    ...env,
  };

  const pool = new Pool(dbConfig);

  const insertEvent = async (event_type: EventType, data: any = null) => {
    const dbClient = await pool.connect();
    try {
      await dbClient.query(
        "INSERT INTO event_store.events (event_type, data) VALUES ($1, $2)",
        [event_type, data]
      );
    } catch (error) {
      logger.error("Error inserting listing:", error);
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const getEvents = async (
    limit = 10,
    returnDeleted = false
  ): Promise<Event[]> => {
    const dbClient = await pool.connect();
    try {
      const listingsEvents = await dbClient.query(
        `
        WITH listings_ids (listing_id) AS (
          SELECT DISTINCT listing_id, position_id 
          FROM event_store.events 
          ORDER BY position_id DESC limit $1
)
        SELECT * FROM event_store.events e
        JOIN listings_ids ON e.listing_id = listings_ids.listing_id
        ORDER BY e.position_id DESC`,
        [limit]
      );
      return listingsEvents.rows;
    } catch (error) {
      logger.error("Error fetching listings:", error);
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const insertEventByID = async (
    listingID: UUID,
    eventType: EventType,
    data: any = null
  ) => {
    const dbClient = await pool.connect();
    try {
      const version = await dbClient.query(
        "SELECT MAX(version) FROM event_store.events WHERE listing_id = $1",
        [listingID]
      );
      if (version.rows[0].max === null) {
        throw new Error("Listing not found");
      }
      await dbClient.query(
        "INSERT INTO event_store.events (listing_id, version, event_type, data) VALUES ($1, $2, $3, $4)",
        [listingID, version.rows[0].max + 1, eventType, data]
      );
    } catch (error) {
      logger.error("Error updating listing:", error);
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const getEventsByID = async (id: UUID) => {
    const dbClient = await pool.connect();
    try {
      const events = await dbClient.query(
        "SELECT * FROM event_store.events WHERE listing_id = $1",
        [id]
      );
      return events.rows;
    } catch (error) {
      logger.error("Error fetching listings:", error);
      throw error;
    } finally {
      dbClient.release();
    }
  };

  return {
    insertEvent,
    getEvents,
    insertEventByID,
    getEventsByID,
  };
};
