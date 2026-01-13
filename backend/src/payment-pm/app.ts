import z from "zod";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { Logger } from "../libs/logger";
import { BookmarkRepository } from "../repositories/bookmarkRepository";
import { Iteration } from "../libs/iteration";
import { IterationMetrics } from "../libs/iterationMetrics";
import { PaymentProviderRepository } from "../repositories/paymentProviderRepository";
import { PaymentProcessManager } from "./paymentProcessManager";
import {
  EnvDBSchema,
  envPMSchema,
  EnvPurchaseSchema,
} from "../libs/validationSchemas";

export default () => {
  const envSchema = z.object({
    app: envPMSchema,
    db: EnvDBSchema,
    purchaseProvider: EnvPurchaseSchema,
  });

  const env = envSchema.parse({
    app: {
      name: process.env.APP_NAME,
      logLevel: process.env.APP_LOG_LEVEL,
      timeout: process.env.APP_LOOP_TIMEOUT,
      numberOfEventsPerIteration:
        process.env.APP_NUMBER_OF_EVENTS_PER_ITERATION,
    },
    db: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    purchaseProvider: {
      secretKey: process.env.STRIPE_SECRET_KEY,
    },
  });

  const logger = Logger(env.app.logLevel);
  const bookmarkRepository = BookmarkRepository(env.db, env.app.name);
  const eventSourceRepository = EventSourceRepository(env.db);
  const paymentProviderRepository = PaymentProviderRepository(
    env.purchaseProvider
  );

  const paymentProcessManager = PaymentProcessManager(
    paymentProviderRepository,
    eventSourceRepository,
  );
  const iterationMetrics = IterationMetrics(env.app.name, logger);
  iterationMetrics.startMetricsServer();
  const iterate = Iteration(
    bookmarkRepository,
    eventSourceRepository,
    paymentProcessManager,
    env.app.numberOfEventsPerIteration,
    iterationMetrics
  );

  const delay = (timeout: number) =>
    new Promise((resolve) => setTimeout(resolve, timeout));

  const start = async () => {
    while (true) {
      try {
        await iterate();
      } catch (error) {
        console.log(error);
        logger.error(error);
      } finally {
        await delay(env.app.timeout);
      }
    }
  };
  start();
};
