import express from "express";
import cors from "cors";
import z from "zod";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { Logger } from "../libs/logger";
import { imagesRouter } from "./imagesRouter";
import { ErrorHandler } from "../libs/errorHandler";
import { RequestLogger } from "../libs/requestLogger";
import path from "path";

export default () => {
  const envSchema = z.object({
    app: z.object({
      port: z.coerce.number(),
      host: z.string(),
      logLevel: z.string(),
      nodeEnv: z.string(),
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

  const eventSourceRepository = EventSourceRepository(env.db);
  const imageRouter = imagesRouter(eventSourceRepository);

  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(requestLogger);
  app.use(cors({ origin: "*" }));

  app.use(`/images`, imageRouter);

  app.use(errorHandler);

  app.listen(env.app.port, () =>
    logger.info(`Server running at http://${env.app.host}:${env.app.port}/`)
  );
};
