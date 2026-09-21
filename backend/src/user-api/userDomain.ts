import { UUID } from "crypto";
import { User, UserStateRepository } from "../repositories/userStateRepository";

export interface UserDomain {
  getUser: (userId: UUID) => Promise<User>;
  getUserByAuthenticationId: (
    authenticationProviderId: string,
  ) => Promise<User>;
}

export const UserDomain = (
  userStateRepository: UserStateRepository,
): UserDomain => {
  const getUser = async (userId: UUID) => {
    const user = await userStateRepository.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  };

  const getUserByAuthenticationId = async (
    authenticationProviderId: string,
  ) => {
    const user = await userStateRepository.getUserByAuthenticationId(
      authenticationProviderId,
    );
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  };

  return {
    getUser,
    getUserByAuthenticationId,
  };
};
