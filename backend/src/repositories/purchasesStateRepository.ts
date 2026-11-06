import { UUID } from "crypto";
import { Pool, PoolConfig } from "pg";
import {
  EventType,
  GetPurchasesResponse,
  PurchaseState,
  PurchaseStateTableRow,
  PurchaseStatus,
} from "../types";
import { EnvDB } from "../libs/validationSchemas";

export interface PurchasesStateRepository {
  updatePurchase: (purchase: PurchaseState) => Promise<void>;
  updatePurchaseStatus: (
    purchaseId: UUID,
    status: PurchaseStatus,
    modifiedAt: Date,
  ) => Promise<void>;
  getPurchases: (
    statuses: PurchaseStatus[],
    limit: number,
    offset: number,
  ) => Promise<GetPurchasesResponse>;
  getPurchasesBySellerId: (
    sellerId: string,
    statuses: PurchaseStatus[],
    limit: number,
    offset: number,
  ) => Promise<GetPurchasesResponse>;
  getPurchasesByBuyerId: (
    buyerId: string,
    statuses: PurchaseStatus[],
    limit: number,
    offset: number,
  ) => Promise<GetPurchasesResponse>;
}

export const PurchasesStateRepository = (
  env: EnvDB,
): PurchasesStateRepository => {
  const dbConfig: PoolConfig = {
    ...env,
  };

  const pool = new Pool(dbConfig);

  const updatePurchase = async (purchase: PurchaseState): Promise<void> => {
    const dbClient = await pool.connect();
    try {
      await dbClient.query(
        `INSERT INTO states.purchases (purchase_id, listing_id, seller_id, buyer_id, price, status, version, modified_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (purchase_id) DO UPDATE
        SET status = $6, version = $7, modified_at = $8;
        `,
        [
          purchase.purchaseId,
          purchase.listingId,
          purchase.sellerId,
          purchase.buyerId,
          purchase.price,
          purchase.status,
          purchase.version,
          purchase.modifiedAt,
        ],
      );
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const updatePurchaseStatus = async (
    purchaseId: UUID,
    status: PurchaseStatus,
    modifiedAt: Date = new Date(),
  ): Promise<void> => {
    const dbClient = await pool.connect();
    try {
      await dbClient.query(
        `UPDATE states.purchases
        SET status = $2, modified_at = $3
        WHERE purchase_id = $1;
        `,
        [purchaseId, status, modifiedAt],
      );
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const getPurchases = async (
    statuses: PurchaseStatus[],
    limit = 10,
    offset = 0,
  ): Promise<GetPurchasesResponse> => {
    const dbClient = await pool.connect();
    try {
      const results = await dbClient.query(
        `SELECT * FROM states.purchases
        WHERE status = ANY($1::text[])
        ORDER BY modified_at DESC
        LIMIT $2 OFFSET $3;
        `,
        [statuses, limit, offset],
      );
      const countOfAll = await dbClient.query(
        `SELECT count(*) FROM states.purchases
        WHERE status = ANY($1::text[]);
        `,
        [statuses],
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
    statuses: PurchaseStatus[],
    limit: number,
    offset: number,
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
        [sellerId, statuses, limit, offset],
      );
      const countOfAll = await dbClient.query(
        `SELECT count(*) FROM states.purchases
        WHERE seller_id = $1
        AND status = ANY($2::text[]);
        `,
        [sellerId, statuses],
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
    statuses: PurchaseStatus[],
    limit: number,
    offset: number,
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
        [buyerId, statuses, limit, offset],
      );
      const countOfAll = await dbClient.query(
        `SELECT count(*) FROM states.purchases
        WHERE buyer_id = $1
        AND status = ANY($2::text[]);
        `,
        [buyerId, statuses],
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
    purchaseId: row.purchase_id as UUID,
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
    updatePurchaseStatus,
    getPurchases,
    getPurchasesBySellerId,
    getPurchasesByBuyerId,
  };
};
