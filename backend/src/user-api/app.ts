import express from "express";
import cors from "cors";
import z from "zod";

import { Logger } from "../libs/logger";
import { ErrorHandler } from "../libs/errorHandler";
import { RequestLogger } from "../libs/requestLogger";
import { Authorization, EnvAuthSchema } from "../libs/authorization";
import {
  EnvDBSchema,
  EnvAWSSchema,
  EnvPaymentSchema,
} from "../libs/validationSchemas";
import { RequestMetrics } from "../libs/requestMetrics";
import { UserRouter } from "./userRouter";
import { UserStateRepository } from "../repositories/userStateRepository";
import { PaymentProviderRepository } from "../repositories/paymentProviderRepository";
import { AuthenticationProviderRepository } from "../repositories/AuthenticationProviderRepository";
import { UserDomain } from "../domain/userListingsDomain";

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
    auth: EnvAuthSchema,
    aws: EnvAWSSchema,
    payment: EnvPaymentSchema,
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
    payment: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    },
  });

  const logger = Logger(env.app.logLevel);
  const requestLogger = RequestLogger(logger);
  const errorHandler = ErrorHandler(logger);
  const authorization = Authorization(env.auth);

  const userStateRepository = UserStateRepository(env.db);
  const paymentProviderRepository = PaymentProviderRepository(env.payment);
  const authenticationProviderRepository = AuthenticationProviderRepository(
    env.auth
  );

  const userDomain = UserDomain(
    userStateRepository,
    paymentProviderRepository,
    authenticationProviderRepository
  );

  const userRouter = UserRouter(userDomain);

  const { collectRequestMetrics, startMetricsServer } = RequestMetrics(logger);
  startMetricsServer(env.app.metricsPort);

  const app = express();
  app.use(collectRequestMetrics);
  app.use(cors({ origin: "*" }));
  app.use(requestLogger);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.use(`/api/v1/user`, userRouter);
  app.use(errorHandler);

  app.listen(env.app.port, () =>
    logger.info(`App server listening on port ${env.app.port}`)
  );
};
