import express from "express";
import logger from "./libs/winston";
import { listingsRouter } from "./listings/listingsRouter";
import z from "zod";
import { listingsRepository } from "./listings/listingsRepository";

const envSchema = z.object({
  port: z.string().optional(),
  db: z.object({
    DB_HOST: z.string().optional(),
    DB_PORT: z.string().optional(),
    DB_USER: z.string().optional(),
    DB_PASSWORD: z.string().optional(),
    DB_NAME: z.string().optional(),
    }),
});

const env = envSchema.parse({
  port: process.env.PORT || "3000",
  db: {
    DB_HOST: process.env.DB_HOST || "localhost",
    DB_PORT: process.env.DB_PORT  || "5432",
    DB_USER: process.env.DB_USER  || "defaut_user",
    DB_PASSWORD: process.env.DB_PASSWORD  || "password",
    DB_NAME: process.env.DB_NAME  || "store",
  },
});

const repository = listingsRepository(env.db, logger);
const listingRouter = listingsRouter(repository, logger);

const app = express();

app.use(express.json());
app.use(listingRouter);

app.listen(env.port, () => {
  logger.info(`Server running at http://localhost:${env.port}/`);
});
