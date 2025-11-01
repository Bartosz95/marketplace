import express from "express";
import cors from "cors";
import z from "zod";
import { ListingsStateRepository } from "../repositories/listingsStateRepository";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { ImagesRepository } from "../repositories/imagesRepository";
import { ListingsDomain } from "./domain/listingsDomain";
import { ListingsReadRouter } from "./listingsReadRouter";
import { ListingsWriteRouter } from "./listingsWriteRouter";
import { Logger } from "../libs/logger";
import { ErrorHandler } from "../libs/errorHandler";
import { RequestLogger } from "../libs/requestLogger";
import { Authorization, EnvAuthSchema } from "../libs/authorization";
import { UserListingsDomain } from "./domain/userListingsDomain";
import { UserListingsReadRouter } from "./userListingRouter";
import { PurchasesStateRepository } from "../repositories/purchasesStateRepository";
import { PurchaseRouter } from "./purchaseRouter";
import {
  EnvDBSchema,
  EnvAWSSchema,
  EnvPurchaseSchema,
} from "../libs/validationSchemas";

export const EnvAppSchema = z.object({
  port: z.coerce.number(),
  host: z.string(),
  logLevel: z.string(),
  nodeEnv: z.string().optional(),
});

export type EnvApp = z.infer<typeof EnvAppSchema>;

export default () => {
  const envSchema = z.object({
    app: EnvAppSchema,
    db: EnvDBSchema,
    auth: EnvAuthSchema,
    aws: EnvAWSSchema,
    purchase: EnvPurchaseSchema,
  });

  const env = envSchema.parse({
    app: {
      port: process.env.APP_PORT,
      host: process.env.APP_HOST,
      logLevel: process.env.APP_LOG_LEVEL,
      nodeEnv: process.env.NODE_ENV,
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
    },
  });

  const logger = Logger(env.app.logLevel);
  const requestLogger = RequestLogger(logger);
  const errorHandler = ErrorHandler(logger);
  const authorization = Authorization(env.auth);

  const listingsStateRepository = ListingsStateRepository(env.db);
  const eventSourceRepository = EventSourceRepository(env.db);
  const imagesRepository = ImagesRepository(env.aws);
  const listingsDomain = ListingsDomain(
    listingsStateRepository,
    eventSourceRepository,
    imagesRepository
  );
  const purchasesStateRepository = PurchasesStateRepository(env.db);
  const userListingsDomain = UserListingsDomain(
    listingsStateRepository,
    purchasesStateRepository,
    imagesRepository
  );

  const listingReadRouter = ListingsReadRouter(listingsDomain);
  const listingWriteRouter = ListingsWriteRouter(
    listingsDomain,
    env.aws.bucket
  );
  const userListingReadRouter = UserListingsReadRouter(userListingsDomain);
  const purchaseRouter = PurchaseRouter(listingsDomain, env.purchase);

  const app = express();
  app.use(cors({ origin: "*" }));
  app.use(requestLogger);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.use(`/api/v1/listings`, listingReadRouter);
  app.use(`/api/v1/listings`, authorization, listingWriteRouter);
  app.use(`/api/v1/listings/user`, authorization, userListingReadRouter);
  app.use(`/api/v1/purchase`, purchaseRouter);

  app.use(errorHandler);

  app.listen(env.app.port, () =>
    logger.info(`Server running at http://${env.app.host}:${env.app.port}/`)
  );
};
