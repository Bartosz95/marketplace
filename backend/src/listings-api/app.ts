import express from "express";
import cors from "cors";
import z from "zod";
import Stripe from "stripe";
import { ListingsStateRepository } from "../repositories/listingsStateRepository";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { ImagesRepository } from "../repositories/imagesRepository";
import { ListingsDomain } from "./listingsDomain";
import { ListingsReadRouter } from "./listingsReadRouter";
import { ListingsWriteRouter } from "./listingsWriteRouter";
import { Logger } from "../libs/logger";
import { ErrorHandler } from "../libs/errorHandler";
import { RequestLogger } from "../libs/requestLogger";
import {
  AuthenticationReadRoute,
  AuthenticationWriteRoute,
  EnvAuthenticationMiddlewareSchema,
} from "../libs/authentication";
import {
  EnvDBSchema,
  EnvAWSSchema,
  EnvPaymentSchema,
} from "../libs/validationSchemas";
import { RequestMetrics } from "../libs/requestMetrics";
import { SynchronizeUserMiddleware } from "../libs/syncUserMiddleware";
import { UserStateRepository } from "../repositories/userStateRepository";
import { UserListingsReadDomain } from "./userListingsDomain";
import { UserListingsReadRouter } from "./userListingsReadRouter";
import { PurchasesStateRepository } from "../repositories/purchasesStateRepository";
import { UserDomain } from "../user-api/userDomain";
import { StripeWebhookRouter } from "../payment-api/stripeWebhookRouter";
import { StripeWebhookRepository } from "../repositories/stripeWebhookRepository";

export const EnvAppSchema = z.object({
  port: z.coerce.number(),
  host: z.string(),
  logLevel: z.string(),
  nodeEnv: z.string().optional(),
  metricsPort: z.coerce.number().default(4001),
});

export type EnvApp = z.infer<typeof EnvAppSchema>;

export default () => {
  const envSchema = z.object({
    app: EnvAppSchema,
    db: EnvDBSchema,
    auth: EnvAuthenticationMiddlewareSchema,
    aws: EnvAWSSchema,
    purchase: EnvPaymentSchema,
  });

  const env = envSchema.parse({
    app: {
      port: process.env.APP_PORT,
      host: process.env.APP_HOST,
      logLevel: process.env.APP_LOG_LEVEL,
      nodeEnv: process.env.NODE_ENV,
      metricsPort: process.env.APP_METRICS_PORT,
    },
    db: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    auth: {
      audience: process.env.AUTH_AUDIENCE,
      issuerBaseURL: process.env.AUTH_ISSUER_BASE_URL,
    },
    aws: {
      bucket: {
        region: process.env.AWS_BUCKET_REGION,
        name: process.env.AWS_BUCKET_NAME,
        arn: process.env.AWS_BUCKET_ARN,
        accessKey: process.env.AWS_BUCKET_ACCESS_KEY,
        secretAccessKey: process.env.AWS_BUCKET_SECRET_ACCESS_KEY,
        url: process.env.AWS_BUCKET_URL,
      },
    },
    purchase: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      frontendUrl: process.env.FRONTEND_URL,
    },
  });

  const logger = Logger(env.app.logLevel);
  const requestLogger = RequestLogger(logger);
  const errorHandler = ErrorHandler(logger);
  const authenticationRead = AuthenticationReadRoute(env.auth);
  const authenticationWrite = AuthenticationWriteRoute(env.auth);

  const listingsStateRepository = ListingsStateRepository(env.db);
  const eventSourceRepository = EventSourceRepository(env.db);
  const userStateRepository = UserStateRepository(env.db);
  const purchasesStateRepository = PurchasesStateRepository(env.db);
  const imagesRepository = ImagesRepository(env.aws);
  const stripeWebhookRepository = StripeWebhookRepository(env.db);

  const userDomain = UserDomain(userStateRepository);

  const listingsDomain = ListingsDomain(
    listingsStateRepository,
    eventSourceRepository,
    imagesRepository,
  );

  const userListingsReadDomain = UserListingsReadDomain(
    listingsStateRepository,
    purchasesStateRepository,
    imagesRepository,
  );

  const synchronizeUserMiddleware = SynchronizeUserMiddleware(
    userStateRepository,
    eventSourceRepository,
  );

  const listingsReadRouter = ListingsReadRouter(listingsDomain);
  const listingsWriteRouter = ListingsWriteRouter(
    listingsDomain,
    userDomain,
    eventSourceRepository,
  );
  const userListingsReadRouter = UserListingsReadRouter(
    userListingsReadDomain,
    userDomain,
  );

  const { collectRequestMetrics, startMetricsServer } = RequestMetrics(logger);
  startMetricsServer(env.app.metricsPort);

  const app = express();
  app.use(requestLogger);
  app.use(collectRequestMetrics);
  app.use(cors({ origin: "*" }));
  if (env.purchase.webhookSecret) {
    app.use(
      "/api/v1/stripe/webhook",
      express.raw({ type: "application/json" }),
      StripeWebhookRouter(
        new Stripe(env.purchase.secretKey),
        env.purchase.webhookSecret,
        eventSourceRepository,
        stripeWebhookRepository,
      ),
    );
  }
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(authenticationRead);
  app.use(requestLogger);
  app.use(synchronizeUserMiddleware);
  app.get("/auth-test", (req, res) => {
    console.log("AUTH TEST");
    console.log("Authorization:", req.headers.authorization);
    console.log("req.auth:", req.auth);
    console.log("payload:", req.auth?.payload);

    res.json({
      authenticated: !!req.auth,
      auth: req.auth,
    });
  });

  app.use(`/api/v1/listings`, listingsReadRouter);
  app.use(authenticationWrite);
  app.use(`/api/v1/listings`, listingsWriteRouter);
  app.use(`/api/v1/userlistings`, userListingsReadRouter);
  app.use(errorHandler);
  app.listen(env.app.port, () =>
    logger.info(`App server listening on port ${env.app.port}`),
  );
};
