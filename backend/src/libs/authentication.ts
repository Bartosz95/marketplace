import { auth } from "express-oauth2-jwt-bearer";
import z from "zod";

export const EnvAuthenticationMiddlewareSchema = z.object({
  issuerBaseURL: z.string(),
  audience: z.string(),
});

export type EnvAuthenticationMiddleware = z.infer<
  typeof EnvAuthenticationMiddlewareSchema
>;

export const AuthenticationReadRoute = (env: EnvAuthenticationMiddleware) =>
  auth({
    audience: env.audience,
    issuerBaseURL: env.issuerBaseURL,
    tokenSigningAlg: "RS256",
    authRequired: false,
  });

export const AuthenticationWriteRoute = (env: EnvAuthenticationMiddleware) =>
  auth({
    audience: env.audience,
    issuerBaseURL: env.issuerBaseURL,
    tokenSigningAlg: "RS256",
    authRequired: true,
  });
