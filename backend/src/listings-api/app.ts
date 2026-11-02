import express from "express";
import cors from "cors";
import z from "zod";
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
import { EnvDBSchema, EnvAWSSchema } from "../libs/validationSchemas";
import { RequestMetrics } from "../libs/requestMetrics";
import { SynchronizeUserMiddleware } from "../libs/syncUserMiddleware";
import { UsersStateRepository } from "../repositories/usersStateRepository";
import { UsersListingsReadDomain } from "./usersListingsDomain";
import { UsersListingsReadRouter } from "./usersListingsReadRouter";
import { PurchasesStateRepository } from "../repositories/purchasesStateRepository";
import { UsersDomain } from "../users-api/usersDomain";

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
  });

  const logger = Logger(env.app.logLevel);
  const requestLogger = RequestLogger(logger);
  const errorHandler = ErrorHandler(logger);
  const authenticationRead = AuthenticationReadRoute(env.auth);
  const authenticationWrite = AuthenticationWriteRoute(env.auth);

  const listingsStateRepository = ListingsStateRepository(env.db);
  const eventSourceRepository = EventSourceRepository(env.db);
  const usersStateRepository = UsersStateRepository(env.db);
  const purchasesStateRepository = PurchasesStateRepository(env.db);
  const imagesRepository = ImagesRepository(env.aws);

  const userDomain = UsersDomain(usersStateRepository);

  const listingsDomain = ListingsDomain(
    listingsStateRepository,
    eventSourceRepository,
    imagesRepository,
  );

  const userListingsReadDomain = UsersListingsReadDomain(
    listingsStateRepository,
    purchasesStateRepository,
    imagesRepository,
  );

  const synchronizeUserMiddleware = SynchronizeUserMiddleware(
    usersStateRepository,
    eventSourceRepository,
  );

  const listingsReadRouter = ListingsReadRouter(listingsDomain);
  const listingsWriteRouter = ListingsWriteRouter(
    listingsDomain,
    userDomain,
    eventSourceRepository,
  );
  const userListingsReadRouter = UsersListingsReadRouter(
    userListingsReadDomain,
    userDomain,
  );

  const { collectRequestMetrics, startMetricsServer } = RequestMetrics(logger);
  startMetricsServer(env.app.metricsPort);

  const app = express();
  app.use(requestLogger);
  app.use(collectRequestMetrics);
  app.use(cors({ origin: "*" }));
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(authenticationRead);
  app.use(requestLogger);
  app.use(`/api/v1/listings`, listingsReadRouter);
  app.use(authenticationWrite);
  app.use(synchronizeUserMiddleware);
  app.use(`/api/v1/listings`, listingsWriteRouter);
  app.use(`/api/v1/listings/user`, userListingsReadRouter);
  app.use(errorHandler);
  app.listen(env.app.port, () =>
    logger.info(`App server listening on port ${env.app.port}`),
  );
};
