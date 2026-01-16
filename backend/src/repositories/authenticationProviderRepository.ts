import { EnvAuth } from "../libs/authorization";

export interface AuthenticationProviderRepository {
  createUser: (name: string, email: string) => Promise<string>;
}

export const AuthenticationProviderRepository = (
  env: EnvAuth
): AuthenticationProviderRepository => {
  const createUser = async (name: string, email: string) => {
    return "new-auth-user-id";
  };

  return {
    createUser,
  };
};
