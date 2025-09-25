import express from "express";
import cors from "cors";
import z from "zod";
import { ListingsStateRepository } from "../repositories/listingsStateRepository";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { ListingsDomain } from "./listingsDomain";
import { ListingsReadRouter } from "./listingsReadRouter";
import { ListingsWriteRouter } from "./listingsWriteRouter";
import { Logger } from "../libs/logger";
import { ErrorHandler } from "../libs/errorHandler";
import { RequestLogger } from "../libs/requestLogger";
import { Authorization } from "../libs/authorization";
import { UserListingsDomain } from "./userListingsDomain";
import { UserListingsReadRouter } from "./userListingRouter";

export default () => {
  const envSchema = z.object({
    app: z.object({
      port: z.coerce.number(),
      host: z.string(),
      logLevel: z.string(),
      nodeEnv: z.string().optional(),
    }),
    db: z.object({
      host: z.string(),
      port: z.coerce.number(),
      user: z.string(),
      password: z.string(),
      database: z.string(),
    }),
    auth: z.object({
      audience: z.string(),
      issuerBaseURL: z.string(),
    }),
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
  });

  const logger = Logger(env.app.logLevel);
  const requestLogger = RequestLogger(logger);
  const errorHandler = ErrorHandler(logger);
  const authorization = Authorization(env.auth);

  const listingsStateRepository = ListingsStateRepository(env.db);
  const eventSourceRepository = EventSourceRepository(env.db);
  const listingsDomain = ListingsDomain(
    listingsStateRepository,
    eventSourceRepository
  );
  const userListingsDomain = UserListingsDomain(listingsStateRepository);

  const listingReadRouter = ListingsReadRouter(listingsDomain);
  const listingWriteRouter = ListingsWriteRouter(listingsDomain);
  const userListingReadRouter = UserListingsReadRouter(userListingsDomain);

  const app = express();
  app.use(express.json());
  app.use(cors({ origin: "*" }));
  app.use(requestLogger);

  app.use(`/listings`, listingReadRouter);
  app.use(`/listings`, authorization, listingWriteRouter);
  app.use(`/listings/user`, authorization, userListingReadRouter);

  app.use(errorHandler);

  app.listen(env.app.port, () =>
    logger.info(`Server running at http://${env.app.host}:${env.app.port}/`)
  );
};
