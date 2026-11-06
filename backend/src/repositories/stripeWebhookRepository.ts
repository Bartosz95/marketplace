import { Pool, PoolConfig } from "pg";
import { EnvDB } from "../libs/validationSchemas";
import { UUID } from "crypto";
import { EventData, EventType } from "../types";
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
  webhookSecret: string,
) => {
  const pool = new Pool({ ...env } as PoolConfig);

  const constructEvent = (
    payload: Buffer,
    signature: string,
  ): VerifiedStripeWebhookEvent => {
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
    stripeEventId: string,
    streamId: UUID,
    eventType: EventType.PAYMENT_SUCCEEDED | EventType.PAYMENT_FAILED,
    data: EventData,
  ): Promise<boolean> => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `INSERT INTO states.stripe_webhook_events (stripe_event_id)
         VALUES ($1) ON CONFLICT DO NOTHING`,
        [stripeEventId],
      );
      if (result.rowCount !== 1) {
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
      await client.query("COMMIT");
      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  };

  return { constructEvent, appendEventOnce };
};
