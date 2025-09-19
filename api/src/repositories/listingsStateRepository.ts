import { Logger } from "winston";
import { UUID } from "crypto";
import { Pool, PoolConfig } from "pg";
import { EventType, Listing } from "../types";

export interface ListingStateTableRow {
  listing_id: string;
  modified_at: string;
  status: string;
  title: string;
  description: string;
  price: number;
  images_urls: string[];
}

export interface ListingsStateRepository {
  getListings: (limit?: number, offset?: number) => Promise<Listing[]>;
  getListingById: (listingId: UUID) => Promise<Listing>;
  createListing: (listing: Listing) => Promise<void>;
  updateListing: (
    listingId: UUID,
    data: Listing,
    modifiedAt: Date
  ) => Promise<void>;
  updateListingStatus: (
    listingId: UUID,
    status: EventType,
    modifiedAt: Date
  ) => Promise<void>;
}

export const ListingsStateRepository = (
  logger: Logger,
  env: any
): ListingsStateRepository => {
  const dbConfig: PoolConfig = {
    ...env,
  };

  const pool = new Pool(dbConfig);

  const getListings = async (limit = 10, offset = 0): Promise<Listing[]> => {
    const dbClient = await pool.connect();
    try {
      const results = await dbClient.query(
        `SELECT * FROM states.listings
        ORDER BY modified_at DESC
        LIMIT $1 OFFSET $2;
        `,
        [limit, offset]
      );

      const listings: Listing[] = results.rows.map(mapListing);

      return listings;
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const getListingById = async (listingId: UUID): Promise<Listing> => {
    const dbClient = await pool.connect();
    try {
      const result = await dbClient.query(
        "SELECT * FROM states.listings WHERE listing_id = $1 limit 1",
        [listingId]
      );

      if (result.rows.length === 0) {
        throw new Error(`Listing not found: Listingid: ${listingId}`);
      }
      return mapListing(result.rows[0]);
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const createListing = async (listing: Listing): Promise<void> => {
    const dbClient = await pool.connect();
    try {
      await dbClient.query(
        `INSERT INTO states.listings (listing_id, status, title, description, price, images_urls) 
        VALUES ($1, $2, $3, $4, $5, $6);
        `,
        [
          listing.listingId,
          EventType.LISTING_CREATED,
          listing.title,
          listing.description,
          listing.price,
          listing.imagesUrls,
        ]
      );
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const updateListing = async (
    listingId: UUID,
    listing: Listing,
    modifiedAt: Date
  ) => {
    const dbClient = await pool.connect();
    const { title, description, price, imagesUrls } = listing;
    try {
      await dbClient.query(
        `UPDATE states.listings 
        SET  status = $1, modified_at = $2, title = $3, description  = $4, price = $5, images_urls = $6
        WHERE listing_id = $7;
        `,
        [
          EventType.LISTING_UPDATED,
          modifiedAt,
          title,
          description,
          price,
          imagesUrls,
          listingId,
        ]
      );
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const updateListingStatus = async (
    listingId: UUID,
    status: EventType,
    modifiedAt: Date
  ) => {
    const dbClient = await pool.connect();
    try {
      await dbClient.query(
        `UPDATE states.listings 
        SET status = $1, modified_at = $2
        WHERE listing_id = $3;
        `,
        [status, modifiedAt, listingId]
      );
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const mapListing = (row: ListingStateTableRow): Listing => ({
    listingId: row.listing_id as UUID,
    status: row.status as EventType,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    imagesUrls: row.images_urls as string[],
  });

  return {
    getListings,
    getListingById,
    createListing,
    updateListing,
    updateListingStatus,
  };
};
