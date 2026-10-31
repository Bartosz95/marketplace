import { ManagementClient } from "auth0";
import z from "zod";

export const EnvAuthenticationProviderSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  domain: z.string(),
});

export type EnvAuthenticationprovider = z.infer<
  typeof EnvAuthenticationProviderSchema
>;

export interface AuthenticationProviderRepository {
  getUser: (id: string) => Promise<any>;
}

export const AuthenticationProviderRepository = (
  env: EnvAuthenticationprovider,
): AuthenticationProviderRepository => {
  const management = new ManagementClient({
    domain: env.domain,
    clientId: env.clientId,
    clientSecret: env.clientSecret,
  });

  const getUser = async (id: string) => {
    try {
      const user = await management.users.get({ id });
      return user;
    } catch (err: any) {
      if (err.code === "resource_missing") {
        return null;
      }
      throw err;
    }
  };

  return {
    getUser,
  };
};
