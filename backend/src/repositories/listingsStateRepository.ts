import { UUID } from "crypto";
import { Pool, PoolConfig } from "pg";
import {
  EventType,
  GetListingsResponse,
  ListingState,
  ListingStateTableRow,
  ListingStatus,
} from "../types";
import { EnvDB } from "../libs/validationSchemas";

export interface ListingsStateRepository {
  getListings: (
    statuses: EventType[],
    limit: number,
    offset: number
  ) => Promise<GetListingsResponse>;
  getListingById: (listingId: UUID) => Promise<ListingState | undefined>;
  getListingsByIds: (
    listingId: UUID[],
    limit: number,
    offset: number
  ) => Promise<GetListingsResponse>;
  getListingsByUserId: (
    userId: UUID,
    statuses: EventType[],
    limit: number,
    offset: number
  ) => Promise<GetListingsResponse>;
  updateListing: (listing: ListingState) => Promise<void>;
}

export const ListingsStateRepository = (
  env: EnvDB
): ListingsStateRepository => {
  const dbConfig: PoolConfig = {
    ...env,
  };

  const pool = new Pool(dbConfig);

  const updateListing = async (listing: ListingState): Promise<void> => {
    const dbClient = await pool.connect();
    try {
      await dbClient.query(
        `INSERT INTO states.listings (listing_id, user_id, status, version, title, description, price, images_urls, modified_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (listing_id) DO UPDATE
        SET status = $3, version = $4, title = $5, description = $6, price = $7, images_urls = $8, modified_at = $9;
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
          listing.modifiedAt,
        ]
      );
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const getListings = async (
    statuses: EventType[],
    limit = 10,
    offset = 0
  ): Promise<GetListingsResponse> => {
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
      const countOfAll = await dbClient.query(
        `SELECT count(*) FROM states.listings
        WHERE status = ANY($1::text[]);
        `,
        [statuses]
      );
      return {
        listings: results.rows.map(mapListing),
        countOfAll: mapCountOfAll(countOfAll),
      };
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const getListingById = async (
    listingId: UUID
  ): Promise<ListingState | undefined> => {
    const dbClient = await pool.connect();
    try {
      const result = await dbClient.query(
        `SELECT * FROM states.listings WHERE listing_id = $1 limit 1;`,
        [listingId]
      );
      return result.rows.map(mapListing).shift();
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const getListingsByIds = async (
    listingsIds: UUID[],
    limit: number,
    offset: number
  ): Promise<GetListingsResponse> => {
    const dbClient = await pool.connect();
    try {
      const results = await dbClient.query(
        `SELECT * FROM states.listings 
        WHERE listing_id = ANY($1::UUID[])
        LIMIT $2 OFFSET $3;`,
        [listingsIds, limit, offset]
      );
      const countOfAll = await dbClient.query(
        `SELECT count(*) FROM states.listings
        WHERE listing_id = ANY($1::UUID[]);
        `,
        [listingsIds]
      );
      return {
        listings: results.rows.map(mapListing),
        countOfAll: mapCountOfAll(countOfAll),
      };
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const getListingsByUserId = async (
    userId: UUID,
    statuses: EventType[],
    limit: number,
    offset: number
  ): Promise<GetListingsResponse> => {
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
      const countOfAll = await dbClient.query(
        `SELECT count(*) FROM states.listings
        WHERE user_id = $1
        AND status = ANY($2::text[]);
        `,
        [userId, statuses]
      );
      return {
        listings: results.rows.map(mapListing),
        countOfAll: mapCountOfAll(countOfAll),
      };
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

  const mapCountOfAll = (result: { rows: Array<{ count: number }> }): number =>
    result.rows[0].count;

  return {
    getListings,
    getListingById,
    getListingsByIds,
    getListingsByUserId,
    updateListing,
  };
};
