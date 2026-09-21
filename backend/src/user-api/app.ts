import express from "express";
import cors from "cors";
import z from "zod";
import { Logger } from "../libs/logger";
import { ErrorHandler } from "../libs/errorHandler";
import { RequestLogger } from "../libs/requestLogger";
import {
  Authentication,
  EnvAuthenticationMiddlewareSchema,
} from "../libs/authentication";
import { EnvDBSchema } from "../libs/validationSchemas";
import { RequestMetrics } from "../libs/requestMetrics";
import { UserRouter } from "./userRouter";
import { UserStateRepository } from "../repositories/userStateRepository";
import { UserDomain } from "./userDomain";

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
    authentication: EnvAuthenticationMiddlewareSchema,
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
    authentication: {
      audience: process.env.AUTH_AUDIENCE,
      issuerBaseURL: process.env.AUTH_ISSUER_BASE_URL,
    },
  });

  const logger = Logger(env.app.logLevel);
  const requestLogger = RequestLogger(logger);
  const errorHandler = ErrorHandler(logger);

  const authentication = Authentication(env.authentication);

  const userStateRepository = UserStateRepository(env.db);
  const userDomain = UserDomain(userStateRepository);
  const userRouter = UserRouter(userDomain);

  const { collectRequestMetrics, startMetricsServer } = RequestMetrics(logger);
  startMetricsServer(env.app.metricsPort);

  const app = express();
  app.use(collectRequestMetrics);
  app.use(cors({ origin: "*" }));
  app.use(requestLogger);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(authentication);
  app.use(`/api/v1/user`, userRouter);
  app.use(errorHandler);
  app.listen(env.app.port, () =>
    logger.info(`App server listening on port ${env.app.port}`),
  );
};
