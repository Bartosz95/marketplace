import { Pool, PoolConfig } from "pg";
import { EnvDB } from "../libs/validationSchemas";

export const StripeWebhookRepository = (env: EnvDB) => {
  const pool = new Pool({ ...env } as PoolConfig);

  const claim = async (stripeEventId: string): Promise<boolean> => {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO states.stripe_webhook_events (stripe_event_id)
         VALUES ($1) ON CONFLICT DO NOTHING`,
        [stripeEventId],
      );
      return result.rowCount === 1;
    } finally {
      client.release();
    }
  };

  return { claim };
};
