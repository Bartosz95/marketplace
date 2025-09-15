import express from "express";
import session from "express-session";
import z from "zod";
import { Logger } from "./libs/winston";
import { ExpressOIDC } from "@okta/oidc-middleware";
import { listingsRouter } from "./listings/listingsRouter";
import { listingsRepository } from "./listings/listingsRepository";
import OktaJwtVerifier from "@okta/jwt-verifier";
import { listings } from "./domain/listings";

const envSchema = z.object({
  app: z.object({
    PORT: z.coerce.number().optional(),
    HOST: z.string().optional(),
    LOG_LEVEL: z.string(),
  }),
  db: z.object({
    host: z.string().optional(),
    port: z.coerce.number().optional(),
    user: z.string().optional(),
    password: z.string().optional(),
    database: z.string().optional(),
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
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || "5432",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "marketplace",
  },
  oicd: {
    SESSION: process.env.AUTH_SESSION_SECRET,
    ISSUER: process.env.AUTH_ISSUER,
    CLIENT_ID: process.env.AUTH_CLIENT_ID,
    CLIENT_SECRET: process.env.AUTH_CLIENT_SECRET,
    APP_BASE_URL: process.env.AUTH_APP_BASE_URL,
  },
});

const logger = Logger(env.app.LOG_LEVEL);

const repository = listingsRepository(logger, env.db);
const listingsDomain = listings(repository, logger);
const listingRouter = listingsRouter(listingsDomain, logger);

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.body);
  next();
});

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

app.use(`/`, listingRouter);

oidc.on("ready", () => {
  app.listen(env.app.PORT, () =>
    console.log(`Server running at http://${env.app.HOST}:${env.app.PORT}/`)
  );
});

oidc.on("error", (err) => {
  console.error("OIDC error:", err);
});
