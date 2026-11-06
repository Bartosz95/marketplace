import { z } from "zod";
import { AuthenticationProviderRepository } from "../repositories/authenticationProviderRepository";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { UsersStateRepository } from "../repositories/usersStateRepository";

const authenticationUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  nickname: z.string().optional(),
  email_verified: z.boolean().optional(),
});

export class AuthenticationUserNotFoundError extends Error {}

export interface UserProvisioningDomain {
  ensureUserExists: (authenticationProviderId: string) => Promise<boolean>;
}

export const UserProvisioningDomain = (
  usersStateRepository: UsersStateRepository,
  authenticationProviderRepository: AuthenticationProviderRepository,
  eventSourceRepository: EventSourceRepository,
): UserProvisioningDomain => {
  const ensureUserExists = async (authenticationProviderId: string) => {
    if (
      await usersStateRepository.userExistsWithAuthenticationId(
        authenticationProviderId,
      )
    ) {
      return true;
    }

    const response =
      await authenticationProviderRepository.getUser(authenticationProviderId);
    if (!response) {
      throw new AuthenticationUserNotFoundError(
        `Auth0 user ${authenticationProviderId} was not found`,
      );
    }

    const profile = authenticationUserSchema.parse(response.data);
    await eventSourceRepository.ensureUserFirstRequest(
      authenticationProviderId,
      {
        authenticationProviderId,
        name: profile.name,
        email: profile.email,
        nickname: profile.nickname,
        emailVerified: profile.email_verified,
      },
    );

    return usersStateRepository.userExistsWithAuthenticationId(
      authenticationProviderId,
    );
  };

  return { ensureUserExists };
};
