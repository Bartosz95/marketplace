import express from "express";
import cors from "cors";
import Stripe from "stripe";
import z from "zod";
import { EnvDBSchema, EnvPaymentSchema } from "../libs/validationSchemas";
import { Logger } from "../libs/logger";
import { ErrorHandler } from "../libs/errorHandler";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { StripeWebhookRepository } from "../repositories/stripeWebhookRepository";
import { StripeWebhookRouter } from "./stripeWebhookRouter";
import { PaymentDomain } from "./paymentDomain";
import { PaymentRouter } from "./paymentRouter";
import { PaymentProviderRepository } from "../repositories/paymentProviderRepository";
import {
  AuthenticationWriteRoute,
  EnvAuthenticationMiddlewareSchema,
} from "../libs/authentication";

export default () => {
  const envSchema = z.object({
    app: z.object({
      port: z.coerce.number(),
      logLevel: z.string(),
    }),
    db: EnvDBSchema,
    authentication: EnvAuthenticationMiddlewareSchema,
    paymentProvider: EnvPaymentSchema.extend({
      webhookSecret: z.string().min(1),
    }),
  });

  const env = envSchema.parse({
    app: {
      port: process.env.APP_PORT,
      logLevel: process.env.APP_LOG_LEVEL,
    },
    db: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    authentication: {
      audience: process.env.AUTH_AUDIENCE,
      issuerBaseURL: process.env.AUTH_ISSUER_BASE_URL,
    },
    paymentProvider: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
  });

  const logger = Logger(env.app.logLevel);
  const errorHandler = ErrorHandler(logger);
  const stripe = new Stripe(env.paymentProvider.secretKey);
  const eventSourceRepository = EventSourceRepository(env.db);
  const stripeWebhookRepository = StripeWebhookRepository(
    env.db,
    stripe,
    env.paymentProvider.webhookSecret,
  );
  const paymentProvider = PaymentProviderRepository(env.paymentProvider);
  const paymentDomain = PaymentDomain(
    eventSourceRepository,
    stripeWebhookRepository,
    paymentProvider,
  );
  const webhookRouter = StripeWebhookRouter(paymentDomain);
  const paymentRouter = PaymentRouter(paymentDomain);

  const app = express();
  app.use(cors({ origin: "*" }));
  app.use(
    "/api/v1/payments/stripe/webhook",
    express.raw({ type: "application/json" }),
    webhookRouter,
  );
  app.use(AuthenticationWriteRoute(env.authentication));
  app.use("/api/v1/payments", paymentRouter);
  app.use(errorHandler);
  stripeWebhookRepository
    .ensurePaymentEventSchema()
    .then(() =>
      app.listen(env.app.port, () =>
        logger.info(`Payment API listening on port ${env.app.port}`),
      ),
    )
    .catch((error) => {
      logger.error("Failed to prepare payment event storage", { error });
      process.exitCode = 1;
    });
};
