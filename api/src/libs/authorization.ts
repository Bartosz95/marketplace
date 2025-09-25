import { auth } from "express-oauth2-jwt-bearer";
import z from "zod";

const AuthorizationSchema = z.object({
  audience: z.string(),
  issuerBaseURL: z.string(),
});

export type AuthorizationEnvironments = z.infer<typeof AuthorizationSchema>;

export const Authorization = (env: AuthorizationEnvironments) =>
  auth({
    audience: env.audience,
    issuerBaseURL: env.issuerBaseURL,
    tokenSigningAlg: "RS256",
    authRequired: false,
  });
