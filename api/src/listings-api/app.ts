import express from "express";
import { Request, Response, NextFunction } from "express";
import cors from "cors";
import z from "zod";
import { ListingsStateRepository } from "../repositories/listingsStateRepository";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { Listings } from "./listingsDomain";
import { listingsRouter } from "./listingsRouter";
import { auth } from "express-oauth2-jwt-bearer";
import { Logger } from "../libs/logger";

export default () => {
  const envSchema = z.object({
    app: z.object({
      port: z.coerce.number(),
      host: z.string(),
      logLevel: z.string(),
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

  const listingsStateRepository = ListingsStateRepository(logger, env.db);
  const eventSourceRepository = EventSourceRepository(logger, env.db);
  const listingsDomain = Listings(
    listingsStateRepository,
    eventSourceRepository,
    logger
  );
  const listingRouter = listingsRouter(listingsDomain, logger);

  const app = express();
  app.use(express.json());
  app.use(cors({ origin: "*" }));

  // const jwtCheck = auth({
  //   audience: env.auth.audience,
  //   issuerBaseURL: env.auth.issuerBaseURL,
  //   tokenSigningAlg: "RS256",
  // });

  // app.use(jwtCheck);

  app.use(`/`, listingRouter);

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.stack);
    res.status(err.status || 500).send();
  });

  app.listen(env.app.port, () =>
    logger.info(`Server running at http://${env.app.host}:${env.app.port}/`)
  );
};
