import { Logger } from "winston";
import { Pool } from "pg";
import { UUID } from "crypto";

export interface Item {
  title: string,
  description: string,
  price: number,
  imageUrls: string[],
}

enum EventType {
  LISTING_CREATED = "LISTING_CREATED",
  LISTING_UPDATED = "LISTING_UPDATED",
  LISTING_DELETED = "LISTING_DELETED",
  LISTING_BOUGHT = "LISTING_BOUGHT",
}

export interface Listing extends Item {
  listing_id?: UUID,
  status: EventType,
}

export interface Event {
  event_id?: UUID,
  created_at?: string,
  event_type: EventType,
  data?: Listing
  metadata?: any,
}

export interface ListingsRepository {
  createListing: (listing: Listing) => Promise<void>,
  getListing: (id: UUID) => Promise<Listing|null>,
  deleteListing: (id: UUID) => Promise<void>,
  getListings: (limit?: number, returnDeleted?: boolean) => Promise<Listing[]>,
  
}

export const listingsRepository = (envDB: any, logger: Logger): ListingsRepository => {
  const pool  = new Pool({
    host: envDB.DB_HOST,
    port: envDB.DB_PORT,
    user: envDB.DB_USER,
    password: envDB.DB_PASSWORD,
    database: envDB.DB_NAME,
  });

    const createListing = async (item: Item) => {
      const dbClient = await pool.connect();
      try {

        const event: Event = {
          event_type: EventType.LISTING_CREATED,
          data: {...item, status: EventType.LISTING_CREATED},
        }
        
        await dbClient.query(
          'INSERT INTO event_store.events (event_type, data) VALUES ($1, $2)',
          [event.event_type, event.data]
        );
      } catch (error) {
        logger.error("Error inserting listing:", error);
        throw error;
      } finally {
        dbClient.release();
      }
    }

    const buildListingFromEvents = (events: Event[]): Listing|null => {
      if (events.length === 0) {
        return null;
      }
      let listing = {}
      for (const event of events) {
        switch (event.event_type) {
          case EventType.LISTING_CREATED:
            listing = { ...event.data, status: event.event_type }
            break;
          case EventType.LISTING_UPDATED:
            if (!listing) throw new Error("Inconsistent state: UPDATE event without prior CREATE event");
            listing = { ...listing, ...event.data, status: event.event_type };
            break;
          case EventType.LISTING_DELETED:
            if (!listing) throw new Error("Inconsistent state: UPDATE event without prior CREATE event");
            listing = { ...listing, status: event.event_type };
            break;
        }
      }
      return listing as Listing;
    }

    const getListing = async (id: UUID) => {
      const dbClient = await pool.connect();
      
      try {
        const events = await dbClient.query('SELECT * FROM event_store.events WHERE id = $1 order by created_at', [id]);
        const listing = buildListingFromEvents(events.rows);
        return listing;
      } catch (error) {
        logger.error("Error fetching listings:", error);
        throw error;
      } finally {
        dbClient.release();
      }
    }

    const deleteListing = async (id: UUID) => {
      const dbClient = await pool.connect();
      
      try {
        const events = await dbClient.query('INSERT INTO event_store.events (event_id, event_type) VALUES ($1, $2)', [id, EventType.LISTING_DELETED]);
      } catch (error) {
        logger.error("Error fetching listings:", error);
        throw error;
      } finally {
        dbClient.release();
      }
    }


    const getListings = async (limit = 10, returnDeleted = false): Promise<Listing[]> => {
      const dbClient = await pool.connect();
      const listings: Listing[] = [];
      try {
        const listingsIDs = await dbClient.query('SELECT distinct listing_id FROM event_store.events order by created_at limit $1', [limit]);
        for (const listingID of listingsIDs.rows) {
          const events = await dbClient.query('SELECT * FROM event_store.events WHERE id = $1 order by created_at', [listingID]);
          const listing = buildListingFromEvents(events.rows);
          if (listing && ( returnDeleted || listing.status === EventType.LISTING_DELETED)) {
            listings.push(listing);
          }
        }
        return listings;
      } catch (error) {
        logger.error("Error fetching listings:", error);
        throw error;
      } finally {
        dbClient.release();
      }
    }

    

  return {
    createListing,
    getListing,
    getListings,
    deleteListing,
  }
};