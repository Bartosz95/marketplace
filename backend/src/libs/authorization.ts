import { auth } from "express-oauth2-jwt-bearer";
import z from "zod";

export const EnvAuthSchema = z.object({
  audience: z.string(),
  issuerBaseURL: z.string(),
});

export type EnvAuth = z.infer<typeof EnvAuthSchema>;

export const Authorization = (env: EnvAuth) =>
  auth({
    audience: env.audience,
    issuerBaseURL: env.issuerBaseURL,
    tokenSigningAlg: "RS256",
    authRequired: false,
  });
