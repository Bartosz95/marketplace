import express from "express";
import session from "express-session";
import z from "zod";
import { Logger } from "./libs/winston";
import { ExpressOIDC } from "@okta/oidc-middleware";
import { listingsRouter } from "./listings/listingsRouter";

import { listingsRepository } from "./listings/listingsRepository";

const envSchema = z.object({
  app: z.object({
    PORT: z.string().optional(),
    HOST: z.string().optional(),
    LOG_LEVEL: z.string(),
  }),
  db: z.object({
    HOST: z.string().optional(),
    PORT: z.string().optional(),
    USER: z.string().optional(),
    PASSWORD: z.string().optional(),
    NAME: z.string().optional(),
    }),
  oicd: z.object({
    SESSION: z.string(),
    ISSUER: z.string(),
    CLIENT_ID: z.string(),
    CLIENT_SECRET: z.string(),
    APP_BASE_URL: z.string(),
  }),
});

const env = envSchema.parse({
  app: {
    PORT: process.env.APP_PORT || "3000",
    HOST: process.env.APP_HOST || "localhost",
    LOG_LEVEL: process.env.APP_LOG_LEVEL || "info",
  },
  db: {
    HOST: process.env.DB_HOST || "localhost",
    PORT: process.env.DB_PORT  || "5432",
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    NAME: process.env.DB_NAME,
  },
  oicd: {
    SESSION: process.env.AUTH_SESSION_SECRET,
    ISSUER: process.env.AUTH_ISSUER,
    CLIENT_ID: process.env.AUTH_CLIENT_ID,
    CLIENT_SECRET: process.env.AUTH_CLIENT_SECRET,
    APP_BASE_URL: process.env.AUTH_APP_BASE_URL,
  }
});

console.log(env);
const logger = Logger(env.app.LOG_LEVEL);
const repository = listingsRepository(env.db, logger);
const listingRouter = listingsRouter(repository, logger);

const app = express();
app.use(express.json());
app.use(
  session({
    secret: env.oicd.SESSION,
    resave: true,
    saveUninitialized: false,
  })
);

const oidc = new ExpressOIDC({
  issuer: env.oicd.ISSUER,
  client_id: env.oicd.CLIENT_ID,
  client_secret: env.oicd.CLIENT_SECRET,
  appBaseUrl: env.oicd.APP_BASE_URL,
  scope: "openid profile email",
});

app.use(oidc.router as any);
app.get("/profile", oidc.ensureAuthenticated() as any, (req, res) => {
  res.json(req.userContext);
});

app.use(`/`, oidc.ensureAuthenticated() as any, listingRouter);

oidc.on("ready", () => {
  app.listen(env.app.PORT, () => logger.info(`Server running at http://${env.app.HOST}:${env.app.PORT}/`));
});

oidc.on("error", (err) => {
  console.error("OIDC error:", err);
});
