import { Pool, PoolConfig } from "pg";
import { EnvDB } from "../libs/validationSchemas";
import { UUID } from "crypto";
import {
  EventType,
  PaymentFailedEventData,
  PaymentSucceededEventData,
} from "../types";
import Stripe from "stripe";

export interface VerifiedStripeWebhookEvent {
  id: string;
  type: string;
  sessionId?: string;
  paymentStatus?: string;
}

export const StripeWebhookRepository = (
  env: EnvDB,
  stripe: Stripe,
  webhookSecret?: string,
) => {
  const pool = new Pool({ ...env } as PoolConfig);

  const constructEvent = (
    payload: Buffer,
    signature: string,
  ): VerifiedStripeWebhookEvent => {
    if (!webhookSecret) {
      throw new Error("Stripe webhook secret is not configured");
    }
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
    if (!event.type.startsWith("checkout.session.")) {
      return { id: event.id, type: event.type };
    }

    const session = event.data.object as Stripe.Checkout.Session;
    return {
      id: event.id,
      type: event.type,
      sessionId: session.id,
      paymentStatus: session.payment_status,
    };
  };

  const appendEventOnce = async (
    eventIdempotencyKey: string,
    streamId: UUID,
    eventType: EventType.PAYMENT_SUCCEEDED | EventType.PAYMENT_FAILED,
    data: PaymentSucceededEventData | PaymentFailedEventData,
    source: "webhook" | "reconciliation",
  ): Promise<boolean> => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
        streamId,
      ]);
      const result = await client.query(
        `INSERT INTO states.stripe_webhook_events
          (idempotency_key, purchase_id, source, event_type)
         VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
        [eventIdempotencyKey, streamId, source, eventType],
      );
      if (result.rowCount !== 1) {
        await client.query("COMMIT");
        return false;
      }
      const existingOutcome = await client.query(
        `SELECT 1 FROM event_store.events
        WHERE stream_id = $1
        AND (
          event_type = $2
          OR ($2 = $3 AND event_type = $4)
        )
        LIMIT 1`,
        [
          streamId,
          eventType,
          EventType.PAYMENT_FAILED,
          EventType.PAYMENT_SUCCEEDED,
        ],
      );
      if (existingOutcome.rowCount !== 0) {
        await client.query("COMMIT");
        return false;
      }
      await client.query(
        `WITH max_version AS (
          SELECT COALESCE(MAX(version), 0) AS v
          FROM event_store.events
          WHERE stream_id = $1
        )
        INSERT INTO event_store.events (stream_id, event_type, data, version)
        SELECT $1, $2, $3, v + 1
        FROM max_version`,
        [streamId, eventType, data],
      );
      if (eventType === EventType.PAYMENT_SUCCEEDED) {
        await client.query(
          `WITH max_version AS (
            SELECT COALESCE(MAX(version), 0) AS v
            FROM event_store.events
            WHERE stream_id = $1
          )
          INSERT INTO event_store.events (stream_id, event_type, data, version)
          SELECT $1, $2, $3, v + 1
          FROM max_version`,
          [
            data.listingId,
            EventType.LISTING_PURCHASED,
            {
              sellerId: data.sellerId,
              buyerId: data.buyerId,
              price: data.price,
            },
          ],
        );
      }
      await client.query("COMMIT");
      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  };

  const ensurePaymentEventSchema = async () => {
    const client = await pool.connect();
    try {
      await client.query(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'states'
              AND table_name = 'stripe_webhook_events'
              AND column_name = 'stripe_event_id'
          ) AND NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'states'
              AND table_name = 'stripe_webhook_events'
              AND column_name = 'idempotency_key'
          ) THEN
            ALTER TABLE states.stripe_webhook_events
            RENAME COLUMN stripe_event_id TO idempotency_key;
          END IF;
        END
        $$
      `);
      await client.query(`
        ALTER TABLE states.stripe_webhook_events
        ADD COLUMN IF NOT EXISTS purchase_id UUID
      `);
      await client.query(`
        ALTER TABLE states.stripe_webhook_events
        ADD COLUMN IF NOT EXISTS idempotency_key TEXT
      `);
      await client.query(`
        ALTER TABLE states.stripe_webhook_events
        ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'webhook'
      `);
      await client.query(`
        ALTER TABLE states.stripe_webhook_events
        ADD COLUMN IF NOT EXISTS event_type TEXT
      `);
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS
          stripe_webhook_events_idempotency_key_idx
        ON states.stripe_webhook_events (idempotency_key)
      `);
      await client.query(`
        ALTER TABLE states.stripe_webhook_events
        ALTER COLUMN idempotency_key SET NOT NULL
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_purchase_id
        ON states.stripe_webhook_events (purchase_id)
      `);
      await client.query(
        `UPDATE states.stripe_webhook_events tracked
        SET purchase_id = outcome.stream_id,
          event_type = outcome.event_type,
          source = CASE
            WHEN tracked.idempotency_key LIKE 'reconcile:%'
              THEN 'reconciliation'
            ELSE 'webhook'
          END
        FROM event_store.events outcome
        WHERE (tracked.purchase_id IS NULL OR tracked.event_type IS NULL)
        AND outcome.event_type IN ($1, $2)
        AND (
          outcome.data->>'stripeEventId' = tracked.idempotency_key
          OR left(
            tracked.idempotency_key,
            length(
              'reconcile:' || (outcome.data->>'checkoutSessionId') || ':'
            )
          ) = 'reconcile:' || (outcome.data->>'checkoutSessionId') || ':'
        )`,
        [EventType.PAYMENT_SUCCEEDED, EventType.PAYMENT_FAILED],
      );
      await client.query(
        `UPDATE states.stripe_webhook_events
        SET source = CASE
          WHEN idempotency_key LIKE 'reconcile:%'
            THEN 'reconciliation'
          ELSE 'webhook'
        END
        WHERE source IS DISTINCT FROM CASE
          WHEN idempotency_key LIKE 'reconcile:%'
            THEN 'reconciliation'
          ELSE 'webhook'
        END`,
      );
    } finally {
      client.release();
    }
  };

  return { constructEvent, appendEventOnce, ensurePaymentEventSchema };
};
