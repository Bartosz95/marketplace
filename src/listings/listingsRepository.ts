import { Logger } from "winston";
import { Pool } from "pg";
import { UUID } from "crypto";

enum EventType {
  LISTING_CREATED = "LISTING_CREATED",
  LISTING_UPDATED = "LISTING_UPDATED",
  LISTING_DELETED = "LISTING_DELETED",
  LISTING_BOUGHT = "LISTING_BOUGHT",
}

export interface Listing {
  status?: EventType,
  title: string,
  description?: string,
  price: number,
  imageUrls: string[],
}

export interface Event {
  event_id?: UUID,
  listing_id?: UUID,
  position_id?: number,
  version?: number,
  created_at?: string,
  event_type: EventType,
  data?: Listing
  metadata?: any,
}

export interface ListingsRepository {
  createListing: (listing: Listing) => Promise<void>,
  readListing: (listing_id: UUID) => Promise<Listing|null>,
  updateListing: (listing_id: UUID, listing: Listing) => Promise<void>,
  deleteListing: (listing_id: UUID) => Promise<void>,
  readListings: (limit?: number, returnDeleted?: boolean) => Promise<Listing[]>,
  
}

export const listingsRepository = (env: any, logger: Logger): ListingsRepository => {
  const pool  = new Pool({
    host: env.HOST,
    port: env.PORT,
    user: env.USER,
    password: env.PASSWORD,
    database: env.NAME,
  });

  const createListing = async (listing: Listing) => {
    const dbClient = await pool.connect();
    try {

      const event: Event = {
        event_type: EventType.LISTING_CREATED,
        data: {...listing, status: EventType.LISTING_CREATED},
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

  const readListing = async (listingID: UUID) => {
    const dbClient = await pool.connect();
    
    try {
      const events = await dbClient.query('SELECT * FROM event_store.events WHERE id = $1 order by created_at', [listingID]);
      const listing = buildListingFromEvents(events.rows);
      return listing;
    } catch (error) {
      logger.error("Error fetching listings:", error);
      throw error;
    } finally {
      dbClient.release();
    }
  }

  const updateListing = async (listingID: UUID, listing: Listing) => {
    const dbClient = await pool.connect();
    try {

      const event: Event = {
        listing_id: listingID,
        event_type: EventType.LISTING_UPDATED,
        data: {...listing, status: EventType.LISTING_UPDATED},
      }
      
      await dbClient.query(
        'INSERT INTO event_store.events (listing_id, event_type, data) VALUES ($1, $2, $3)',
        [event.listing_id, event.event_type, event.data]
      );
    } catch (error) {
      logger.error("Error updating listing:", error);
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


  const readListings = async (limit = 10, returnDeleted = false): Promise<Listing[]> => {
    const dbClient = await pool.connect();
    const listings: Listing[] = [];
    try {
      const listingsIDs = await dbClient.query('SELECT distinct listing_id, created_at FROM event_store.events order by created_at limit $1', [limit]);
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
    readListing,
    updateListing,
    deleteListing,
    readListings,
  }
};