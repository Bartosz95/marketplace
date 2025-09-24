import { UUID } from "crypto";
import { Pool, PoolConfig } from "pg";
import {
  EventType,
  ListingState,
  ListingStateTableRow,
  ListingStatus,
} from "../types";

export interface ListingsStateRepository {
  getListings: (
    statuses: EventType[],
    limit: number,
    offset: number
  ) => Promise<ListingState[]>;
  getListingById: (listingId: UUID) => Promise<ListingState>;
  getListingsByUserId: (
    userId: string,
    statuses: EventType[],
    limit: number,
    offset: number
  ) => Promise<ListingState[]>;
  createListing: (listing: ListingState) => Promise<void>;
  updateListing: (listing: ListingState) => Promise<void>;
}

export const ListingsStateRepository = (env: any): ListingsStateRepository => {
  const dbConfig: PoolConfig = {
    ...env,
  };

  const pool = new Pool(dbConfig);

  const getListings = async (
    statuses: EventType[],
    limit = 10,
    offset = 0
  ): Promise<ListingState[]> => {
    const dbClient = await pool.connect();
    try {
      const results = await dbClient.query(
        `SELECT * FROM states.listings
        WHERE status = ANY($1::text[])
        ORDER BY modified_at DESC
        LIMIT $2 OFFSET $3;
        `,
        [statuses, limit, offset]
      );
      const listings: ListingState[] = results.rows.map(mapListing);

      return listings;
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const getListingById = async (listingId: UUID): Promise<ListingState> => {
    const dbClient = await pool.connect();
    try {
      const result = await dbClient.query(
        `SELECT * FROM states.listings WHERE listing_id = $1 limit 1`,
        [listingId]
      );

      if (result.rows.length === 0) {
        throw new Error(`Listing ${listingId} does not exists`);
      }
      return mapListing(result.rows[0]);
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const getListingsByUserId = async (
    userId: string,
    statuses: EventType[],
    limit: number,
    offset: number
  ): Promise<ListingState[]> => {
    const dbClient = await pool.connect();
    try {
      const results = await dbClient.query(
        `SELECT * FROM states.listings
        WHERE user_id = $1
        AND status = ANY($2::text[])
        ORDER BY modified_at DESC
        LIMIT $3 OFFSET $4;
        `,
        [userId, statuses, limit, offset]
      );
      const listings: ListingState[] = results.rows.map(mapListing);
      return listings;
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const createListing = async (listing: ListingState): Promise<void> => {
    const dbClient = await pool.connect();
    try {
      await dbClient.query(
        `INSERT INTO states.listings (listing_id, user_id, status, version, title, description, price, images_urls) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
        `,
        [
          listing.listingId,
          listing.userId,
          listing.status,
          listing.version,
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

  const updateListing = async (listing: ListingState) => {
    const dbClient = await pool.connect();
    const {
      status,
      listingId,
      title,
      description,
      price,
      imagesUrls,
      modifiedAt,
    } = listing;
    try {
      await dbClient.query(
        `UPDATE states.listings 
        SET  status = $1, modified_at = $2, title = $3, description  = $4, price = $5, images_urls = $6
        WHERE listing_id = $7;
        `,
        [status, modifiedAt, title, description, price, imagesUrls, listingId]
      );
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const mapListing = (row: ListingStateTableRow): ListingState => ({
    listingId: row.listing_id as UUID,
    modifiedAt: new Date(row.modified_at),
    status: row.status as ListingStatus,
    version: row.version,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    imagesUrls: row.images_urls as string[],
  });

  return {
    getListings,
    getListingById,
    getListingsByUserId,
    createListing,
    updateListing,
  };
};
