import { UUID } from "crypto";
import { Pool, PoolConfig } from "pg";
import {
  EventType,
  GetPurchasesResponse,
  PurchaseState,
  PurchaseStateTableRow,
  PurchaseStatus,
} from "../types";

export interface PurchasesStateRepository {
  updatePurchase: (purchase: PurchaseState) => Promise<void>;
  getPurchases: (
    statuses: EventType[],
    limit: number,
    offset: number
  ) => Promise<GetPurchasesResponse>;
  getPurchasesBySellerId: (
    sellerId: string,
    statuses: EventType[],
    limit: number,
    offset: number
  ) => Promise<GetPurchasesResponse>;
  getPurchasesByBuyerId: (
    buyerId: string,
    statuses: EventType[],
    limit: number,
    offset: number
  ) => Promise<GetPurchasesResponse>;
}

export const PurchasesStateRepository = (
  env: any
): PurchasesStateRepository => {
  const dbConfig: PoolConfig = {
    ...env,
  };

  const pool = new Pool(dbConfig);

  const updatePurchase = async (purchase: PurchaseState): Promise<void> => {
    const dbClient = await pool.connect();
    try {
      await dbClient.query(
        `INSERT INTO states.purchases (listing_id, seller_id, buyer_id, price, status, version, modified_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (listing_id) DO UPDATE
        SET status = $5, version = $6, modified_at = $7;
        `,
        [
          purchase.listingId,
          purchase.sellerId,
          purchase.buyerId,
          purchase.price,
          purchase.status,
          purchase.version,
          purchase.modifiedAt,
        ]
      );
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const getPurchases = async (
    statuses: EventType[],
    limit = 10,
    offset = 0
  ): Promise<GetPurchasesResponse> => {
    const dbClient = await pool.connect();
    try {
      const results = await dbClient.query(
        `SELECT * FROM states.purchases
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
        purchases: results.rows.map(mapPurchase),
        countOfAll: mapCountOfAll(countOfAll),
      };
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const getPurchasesBySellerId = async (
    sellerId: string,
    statuses: EventType[],
    limit: number,
    offset: number
  ): Promise<GetPurchasesResponse> => {
    const dbClient = await pool.connect();
    try {
      const results = await dbClient.query(
        `SELECT * FROM states.purchases
        WHERE seller_id = $1
        AND status = ANY($2::text[])
        ORDER BY modified_at DESC
        LIMIT $3 OFFSET $4;
        `,
        [sellerId, statuses, limit, offset]
      );
      const countOfAll = await dbClient.query(
        `SELECT count(*) FROM states.purchases
        WHERE seller_id = $1
        AND status = ANY($2::text[]);
        `,
        [sellerId, statuses]
      );
      return {
        purchases: results.rows.map(mapPurchase),
        countOfAll: mapCountOfAll(countOfAll),
      };
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const getPurchasesByBuyerId = async (
    buyerId: string,
    statuses: EventType[],
    limit: number,
    offset: number
  ): Promise<GetPurchasesResponse> => {
    const dbClient = await pool.connect();
    try {
      const results = await dbClient.query(
        `SELECT * FROM states.purchases
        WHERE buyer_id = $1
        AND status = ANY($2::text[])
        ORDER BY modified_at DESC
        LIMIT $3 OFFSET $4;
        `,
        [buyerId, statuses, limit, offset]
      );
      const countOfAll = await dbClient.query(
        `SELECT count(*) FROM states.purchases
        WHERE buyer_id = $1
        AND status = ANY($2::text[]);
        `,
        [buyerId, statuses]
      );
      return {
        purchases: results.rows.map(mapPurchase),
        countOfAll: mapCountOfAll(countOfAll),
      };
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const mapPurchase = (row: PurchaseStateTableRow): PurchaseState => ({
    listingId: row.listing_id as UUID,
    sellerId: row.seller_id,
    buyerId: row.buyer_id,
    price: row.price,
    modifiedAt: new Date(row.modified_at),
    status: row.status as PurchaseStatus,
    version: row.version,
  });

  const mapCountOfAll = (result: { rows: Array<{ count: number }> }): number =>
    result.rows[0].count;

  return {
    updatePurchase,
    getPurchases,
    getPurchasesBySellerId,
    getPurchasesByBuyerId,
  };
};
