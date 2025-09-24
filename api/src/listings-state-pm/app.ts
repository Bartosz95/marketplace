import z from "zod";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { ListingsStateRepository } from "../repositories/listingsStateRepository";
import { Logger } from "../libs/logger";
import { BookmarkRepository } from "../repositories/bookmarkRepository";
import { ListingStateProcessManager } from "./listingStateProcessManager";

export default () => {
  const envSchema = z.object({
    app: z.object({
      name: z.string(),
      logLevel: z.string(),
      timeout: z.coerce.number(),
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
  const listingsStateRepository = ListingsStateRepository(env.db);
  const processManager = ListingStateProcessManager(listingsStateRepository);

  const delay = (timeout: number) =>
    new Promise((resolve) => setTimeout(resolve, timeout));

  const start = async () => {
    while (true) {
      try {
        const bookmarkPosition = await bookmarkRepository.getBookmark();
        const events = await eventSourceRepository.getEventsFromPosition(
          bookmarkPosition
        );
        if (events.length === 0) continue;
        logger.info(`Processing: ${events.length}`);
        for (const event of events) {
          const eventPossition = event.position;
          await processManager(event);
          await bookmarkRepository.setBookmark(eventPossition);
        }
      } catch (error) {
        logger.error(error);
      } finally {
        await delay(env.app.timeout);
      }
    }
  };
  start();
};
