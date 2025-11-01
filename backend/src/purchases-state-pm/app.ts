import z from "zod";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { Logger } from "../libs/logger";
import { BookmarkRepository } from "../repositories/bookmarkRepository";
import { PurchasesStateProcessManager } from "./purchasesStateProcessManager";
import { PurchasesStateRepository } from "../repositories/purchasesStateRepository";
import { Iteration } from "../libs/iteration";

export default () => {
  const envSchema = z.object({
    app: z.object({
      name: z.string(),
      logLevel: z.string(),
      timeout: z.coerce.number(),
      numberOfEventsPerIteration: z.number().default(100),
    }),
    db: z.object({
      host: z.string(),
      port: z.coerce.number(),
      user: z.string(),
      password: z.string(),
      database: z.string(),
    }),
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
  });

  const logger = Logger(env.app.logLevel);
  const bookmarkRepository = BookmarkRepository(env.db, env.app.name);
  const eventSourceRepository = EventSourceRepository(env.db);
  const purchasesStateRepository = PurchasesStateRepository(env.db);
  const processManager = PurchasesStateProcessManager(purchasesStateRepository);
  const iterate = Iteration(
    logger,
    bookmarkRepository,
    eventSourceRepository,
    processManager,
    env.app.numberOfEventsPerIteration
  );

  const delay = (timeout: number) =>
    new Promise((resolve) => setTimeout(resolve, timeout));

  const start = async () => {
    while (true) {
      try {
        await iterate();
      } catch (error) {
        logger.error(error);
      } finally {
        await delay(env.app.timeout);
      }
    }
  };
  start();
};
