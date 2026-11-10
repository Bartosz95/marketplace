import Stripe from "stripe";
import z from "zod";
import { Logger } from "../libs/logger";
import { EnvDBSchema, EnvPaymentSchema } from "../libs/validationSchemas";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { PaymentProviderRepository } from "../repositories/paymentProviderRepository";
import { StripeWebhookRepository } from "../repositories/stripeWebhookRepository";
import { PaymentReconciliation } from "../payment-api/paymentReconciliation";
import { IterationMetrics } from "../libs/iterationMetrics";

export default () => {
  const envSchema = z.object({
    db: EnvDBSchema,
    paymentProvider: EnvPaymentSchema,
    intervalMs: z.coerce.number().int().positive().default(60_000),
    batchSize: z.coerce.number().int().positive().default(100),
    metricsPort: z.coerce.number().default(4001),
  });

  const env = envSchema.parse({
    db: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    paymentProvider: {
      secretKey: process.env.STRIPE_SECRET_KEY,
    },
    intervalMs: process.env.PAYMENT_RECONCILIATION_INTERVAL_MS,
    batchSize: process.env.PAYMENT_RECONCILIATION_BATCH_SIZE,
    metricsPort: process.env.APP_METRICS_PORT,
  });

  const logger = Logger(process.env.APP_LOG_LEVEL ?? "info");
  const stripe = new Stripe(env.paymentProvider.secretKey);
  const eventSourceRepository = EventSourceRepository(env.db);
  const stripeWebhookRepository = StripeWebhookRepository(env.db, stripe);
  const paymentProvider = PaymentProviderRepository(env.paymentProvider);
  const paymentReconciliation = PaymentReconciliation(
    stripeWebhookRepository,
    paymentProvider,
  );
  const iterationMetrics = IterationMetrics(
    "payment-reconciliation-pm",
    logger,
  );
  iterationMetrics.startMetricsServer(env.metricsPort);
  const delay = (milliseconds: number) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

  const start = async () => {
    await stripeWebhookRepository.ensurePaymentEventSchema();
    await eventSourceRepository.ensurePaymentReconciliationTable();
    logger.info(
      `Payment reconciliation worker running every ${env.intervalMs}ms`,
    );
    while (true) {
      try {
        await paymentReconciliation.reconcilePendingCheckouts(
          eventSourceRepository,
          env.batchSize,
          (error, checkoutSessionId) => {
            logger.error("Failed to reconcile Checkout Session", {
              error,
              checkoutSessionId,
            });
          },
          (result) => {
            iterationMetrics.paymentReconciliationChecks
              .labels({
                process_name: iterationMetrics.processName,
                result,
              })
              .inc();
          },
        );
      } catch (error) {
        logger.error("Payment reconciliation iteration failed", { error });
      } finally {
        await delay(env.intervalMs);
      }
    }
  };
  start().catch((error) => {
    logger.error("Payment reconciliation worker failed to start", { error });
    process.exitCode = 1;
  });
};
