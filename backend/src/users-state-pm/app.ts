import z from "zod";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { Logger } from "../libs/logger";
import { BookmarkRepository } from "../repositories/bookmarkRepository";
import { Iteration } from "../libs/iteration";
import { IterationMetrics } from "../libs/iterationMetrics";
import { EnvDBSchema, EnvPMSchema } from "../libs/validationSchemas";
import { UserStateProcessManager } from "./userStateProcessManager";
import { UsersStateRepository } from "../repositories/usersStateRepository";
import {
  AuthenticationProviderRepository,
  EnvAuthenticationProviderSchema,
} from "../repositories/authenticationProviderRepository";

export default () => {
  const envSchema = z.object({
    app: EnvPMSchema.extend({ imagesUrl: z.string() }),
    db: EnvDBSchema,
    auth: EnvAuthenticationProviderSchema,
  });

  const env = envSchema.parse({
    app: {
      name: process.env.APP_NAME,
      logLevel: process.env.APP_LOG_LEVEL,
      timeout: process.env.APP_LOOP_TIMEOUT,
      numberOfEventsPerIteration:
        process.env.APP_NUMBER_OF_EVENTS_PER_ITERATION,
      imagesUrl: process.env.AWS_BUCKET_URL,
    },
    db: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    auth: {
      domain: process.env.AUTH_MANAGEMENT_DOMAIN,
      clientId: process.env.AUTH_MANAGEMENT_CLIENT_ID,
      clientSecret: process.env.AUTH_MANAGEMENT_CLIENT_SECRET,
    },
  });

  const logger = Logger(env.app.logLevel);
  const bookmarkRepository = BookmarkRepository(env.db, "users-state-pm");
  const eventSourceRepository = EventSourceRepository(env.db);
  const userStateRepository = UsersStateRepository(env.db);
  const authenticationProviderRepository = AuthenticationProviderRepository(
    env.auth,
  );

  const userStateProcessManager = UserStateProcessManager(
    eventSourceRepository,
    userStateRepository,
    authenticationProviderRepository,
  );
  const iterationMetrics = IterationMetrics(env.app.name, logger);
  iterationMetrics.startMetricsServer();
  const iterate = Iteration(
    bookmarkRepository,
    eventSourceRepository,
    userStateProcessManager,
    env.app.numberOfEventsPerIteration,
    iterationMetrics,
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
