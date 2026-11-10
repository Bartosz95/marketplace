import { UUID } from "crypto";
import { Pool, PoolConfig } from "pg";
import {
  CheckoutSessionCreatedEvent,
  EventType,
  Event,
  EventData,
} from "../types";
import { EnvDB } from "../libs/validationSchemas";

export interface EventSourceRepository {
  insertEvent: (eventType: EventType, eventData: EventData) => Promise<UUID>;
  ensureUserFirstRequest: (
    authenticationProviderId: string,
    eventData: EventData,
  ) => Promise<void>;
  insertEventByStreamId: (
    streamId: UUID,
    eventType: EventType,
    eventData: EventData
  ) => Promise<void>;
  getEventsFromPosition: (
    position: number,
    eventsNumber: number
  ) => Promise<Event[]>;
  getLatestEventPosition: () => Promise<number>;
  getEventByCheckoutSessionId: (checkoutSessionId: string) => Promise<Event | undefined>;
  getLatestEventInStream: (streamId: UUID, eventType: EventType) => Promise<Event | undefined>;
  ensurePaymentReconciliationTable: () => Promise<void>;
  getCheckoutEventsToReconcile: (
    limit: number,
  ) => Promise<CheckoutSessionCreatedEvent[]>;
  recordCheckoutReconciliationAttempt: (
    checkoutSessionId: string,
    purchaseId: UUID,
    lastError: string | null,
  ) => Promise<void>;
}

export const EventSourceRepository = (env: EnvDB): EventSourceRepository => {
  const dbConfig: PoolConfig = {
    ...env,
  };

  const pool = new Pool(dbConfig);

  const insertEvent = async (eventType: EventType, data: EventData) => {
    const dbClient = await pool.connect();
    try {
      const result = await dbClient.query(
        "INSERT INTO event_store.events (event_type, data) VALUES ($1, $2) RETURNING stream_id;",
        [eventType, data]
      );
      const { stream_id } = result.rows[0];
      return stream_id;
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const ensureUserFirstRequest = async (
    authenticationProviderId: string,
    data: EventData,
  ) => {
    const dbClient = await pool.connect();
    try {
      await dbClient.query("BEGIN");
      await dbClient.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
        authenticationProviderId,
      ]);
      const existing = await dbClient.query(
        `SELECT 1
        FROM event_store.events
        WHERE event_type = $1 AND data->>'authenticationProviderId' = $2
        LIMIT 1`,
        [EventType.USER_FIRST_REQUEST, authenticationProviderId],
      );
      if (existing.rowCount === 0) {
        await dbClient.query(
          "INSERT INTO event_store.events (event_type, data) VALUES ($1, $2)",
          [EventType.USER_FIRST_REQUEST, data],
        );
      }
      await dbClient.query("COMMIT");
    } catch (error) {
      await dbClient.query("ROLLBACK");
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const insertEventByStreamId = async (
    streamId: UUID,
    eventType: EventType,
    data: EventData
  ) => {
    const dbClient = await pool.connect();
    try {
      await dbClient.query(
        `WITH max_version AS (
          SELECT COALESCE(MAX(version), 0) AS v 
          FROM event_store.events 
          WHERE stream_id = $1
          )
        INSERT INTO event_store.events (stream_id, event_type, data, version)
        SELECT $1, $2, $3, v + 1
        FROM max_version`,
        [streamId, eventType, data]
      );
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const getEventsFromPosition = async (
    startPosition: number,
    eventsNumber: number
  ): Promise<Event[]> => {
    const dbClient = await pool.connect();
    try {
      const endPosition = startPosition + eventsNumber;
      const results = await dbClient.query(
        "SELECT * FROM event_store.events WHERE position BETWEEN $1 AND $2;",
        [startPosition, endPosition]
      );

      const events = results.rows.map(mapEvent);
      return events;
    } catch (error) {
      throw error;
    } finally {
      dbClient.release();
    }
  };

  const getLatestEventPosition = async (): Promise<number> => {
    const dbClient = await pool.connect();
    try {
      const result = await dbClient.query(
        "SELECT COALESCE(MAX(position), 0) AS position FROM event_store.events;",
      );
      return Number(result.rows[0].position);
    } finally {
      dbClient.release();
    }
  };

  const getEventByCheckoutSessionId = async (checkoutSessionId: string) => {
    const dbClient = await pool.connect();
    try {
      const result = await dbClient.query(
        "SELECT * FROM event_store.events WHERE data->>'checkoutSessionId' = $1 LIMIT 1",
        [checkoutSessionId],
      );
      return result.rowCount ? mapEvent(result.rows[0]) : undefined;
    } finally {
      dbClient.release();
    }
  };

  const getLatestEventInStream = async (streamId: UUID, eventType: EventType) => {
    const dbClient = await pool.connect();
    try {
      const result = await dbClient.query(
        "SELECT * FROM event_store.events WHERE stream_id = $1 AND event_type = $2 ORDER BY version DESC LIMIT 1",
        [streamId, eventType],
      );
      return result.rowCount ? mapEvent(result.rows[0]) : undefined;
    } finally {
      dbClient.release();
    }
  };

  const ensurePaymentReconciliationTable = async () => {
    const dbClient = await pool.connect();
    try {
      await dbClient.query(`
        CREATE TABLE IF NOT EXISTS states.payment_reconciliation (
          checkout_session_id TEXT PRIMARY KEY,
          purchase_id UUID NOT NULL,
          attempt_count INTEGER NOT NULL DEFAULT 0,
          next_attempt_at TIMESTAMP,
          last_checked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          last_error TEXT
        )
      `);
      await dbClient.query(`
        ALTER TABLE states.payment_reconciliation
        ADD COLUMN IF NOT EXISTS purchase_id UUID
      `);
      await dbClient.query(`
        ALTER TABLE states.payment_reconciliation
        ADD COLUMN IF NOT EXISTS attempt_count INTEGER NOT NULL DEFAULT 0
      `);
      await dbClient.query(`
        ALTER TABLE states.payment_reconciliation
        ADD COLUMN IF NOT EXISTS next_attempt_at TIMESTAMP
      `);
      await dbClient.query(`
        ALTER TABLE states.payment_reconciliation
        ADD COLUMN IF NOT EXISTS last_error TEXT
      `);
      await dbClient.query(
        `UPDATE states.payment_reconciliation reconciliation
        SET purchase_id = checkout.stream_id
        FROM event_store.events checkout
        WHERE reconciliation.purchase_id IS NULL
        AND checkout.event_type = $1
        AND checkout.data->>'checkoutSessionId' =
          reconciliation.checkout_session_id`,
        [EventType.CHECKOUT_SESSION_CREATED],
      );
      await dbClient.query(`
        CREATE INDEX IF NOT EXISTS idx_payment_reconciliation_purchase_id
        ON states.payment_reconciliation (purchase_id)
      `);
    } finally {
      dbClient.release();
    }
  };

  const getCheckoutEventsToReconcile = async (
    limit: number,
  ): Promise<CheckoutSessionCreatedEvent[]> => {
    const dbClient = await pool.connect();
    try {
      const results = await dbClient.query(
        `SELECT checkout.*
        FROM event_store.events checkout
        LEFT JOIN states.payment_reconciliation reconciliation
          ON reconciliation.checkout_session_id =
            checkout.data->>'checkoutSessionId'
        WHERE checkout.event_type = $1
        AND (
          reconciliation.next_attempt_at IS NULL
          OR reconciliation.next_attempt_at <= CURRENT_TIMESTAMP
        )
        AND NOT EXISTS (
          SELECT 1
          FROM event_store.events outcome
          WHERE outcome.stream_id = checkout.stream_id
          AND outcome.event_type IN ($2, $3)
        )
        ORDER BY reconciliation.next_attempt_at ASC NULLS FIRST,
          reconciliation.last_checked_at ASC NULLS FIRST,
          checkout.position ASC
        LIMIT $4`,
        [
          EventType.CHECKOUT_SESSION_CREATED,
          EventType.PAYMENT_SUCCEEDED,
          EventType.PAYMENT_FAILED,
          limit,
        ],
      );
      return results.rows
        .map(mapEvent)
        .filter(
          (event): event is CheckoutSessionCreatedEvent =>
            event.eventType === EventType.CHECKOUT_SESSION_CREATED,
        );
    } finally {
      dbClient.release();
    }
  };

  const recordCheckoutReconciliationAttempt = async (
    checkoutSessionId: string,
    purchaseId: UUID,
    lastError: string | null,
  ) => {
    const dbClient = await pool.connect();
    try {
      await dbClient.query(
        `INSERT INTO states.payment_reconciliation
          (checkout_session_id, purchase_id, attempt_count, next_attempt_at,
            last_checked_at, last_error)
        VALUES (
          $1, $2, 1,
          CURRENT_TIMESTAMP + make_interval(secs => 10),
          CURRENT_TIMESTAMP, $3
        )
        ON CONFLICT (checkout_session_id)
        DO UPDATE SET purchase_id = EXCLUDED.purchase_id,
          attempt_count = states.payment_reconciliation.attempt_count + 1,
          next_attempt_at = CURRENT_TIMESTAMP + make_interval(
            secs => LEAST(
              3600,
              power(
                2,
                LEAST(states.payment_reconciliation.attempt_count + 1, 12)
              )::integer * 5
            )
          ),
          last_checked_at = CURRENT_TIMESTAMP,
          last_error = EXCLUDED.last_error`,
        [checkoutSessionId, purchaseId, lastError],
      );
    } finally {
      dbClient.release();
    }
  };

  const mapEvent = (row: any): Event => ({
    position: row.position,
    streamId: row.stream_id,
    version: row.version,
    createdAt: row.created_at,
    eventType: row.event_type,
    data: row.data,
    metadata: row.metadata,
  });
  return {
    insertEvent,
    ensureUserFirstRequest,
    insertEventByStreamId,
    getEventsFromPosition,
    getLatestEventPosition,
    getEventByCheckoutSessionId,
    getLatestEventInStream,
    ensurePaymentReconciliationTable,
    getCheckoutEventsToReconcile,
    recordCheckoutReconciliationAttempt,
  };
};
