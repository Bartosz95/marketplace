import { Logger } from "winston";
import { UUID } from "crypto";
import { Pool, PoolConfig } from "pg";
import { EventType, Listing, ListingStatus } from "../types";

export interface ListingStateTableRow {
  listing_id: string;
  owner_id: string;
  modified_at: string;
  status: string;
  title: string;
  description: string;
  price: number;
  images_urls: string[];
}

export interface ListingsStateRepository {
  getListings: (limit?: number, offset?: number) => Promise<Listing[]>;
  getListingById: (listingId: UUID) => Promise<Listing | null>;
  getListingsByOwnerId: (
    ownerId: string,
    limit?: number,
    offset?: number
  ) => Promise<Listing[]>;
  createListing: (listing: Listing) => Promise<void>;
  updateListing: (listing: Listing) => Promise<void>;
}

export const ListingsStateRepository = (env: any): ListingsStateRepository => {
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

  const getListingById = async (listingId: UUID): Promise<Listing | null> => {
    const dbClient = await pool.connect();
    try {
      const result = await dbClient.query(
        "SELECT * FROM states.listings WHERE listing_id = $1 limit 1",
        [listingId]
      );

      if (result.rows.length === 0) {
        return null;
      }
      return mapListing(result.rows[0]);
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const getListingsByOwnerId = async (
    ownerId: string,
    limit = 10,
    offset = 0
  ): Promise<Listing[]> => {
    const dbClient = await pool.connect();
    try {
      const results = await dbClient.query(
        `SELECT * FROM states.listings
        WHERE owner_id = $1
        ORDER BY modified_at DESC
        LIMIT $2 OFFSET $3;
        `,
        [ownerId, limit, offset]
      );
      const listings: Listing[] = results.rows.map(mapListing);
      return listings;
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
        `INSERT INTO states.listings (listing_id, owner_id, status, title, description, price, images_urls) 
        VALUES ($1, $2, $3, $4, $5, $6, $7);
        `,
        [
          listing.listingId,
          listing.ownerId,
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

  const updateListing = async (listing: Listing) => {
    const dbClient = await pool.connect();
    const { listingId, title, description, price, imagesUrls, modifiedAt } =
      listing;
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

  const mapListing = (row: ListingStateTableRow): Listing => ({
    listingId: row.listing_id as UUID,
    modifiedAt: new Date(row.modified_at),
    status: row.status as ListingStatus,
    ownerId: row.owner_id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    imagesUrls: row.images_urls as string[],
  });

  return {
    getListings,
    getListingById,
    getListingsByOwnerId,
    createListing,
    updateListing,
  };
};
