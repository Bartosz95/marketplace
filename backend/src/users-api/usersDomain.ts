import { UUID } from "crypto";
import {
  User,
  UsersStateRepository,
} from "../repositories/usersStateRepository";

export interface UsersDomain {
  getUserByUserId: (userId: UUID) => Promise<User>;
  getUserByAuthenticationId: (
    authenticationProviderId: string,
  ) => Promise<User>;
}

export const UsersDomain = (
  usersStateRepository: UsersStateRepository,
): UsersDomain => {
  const getUserByUserId = async (userId: UUID) => {
    const user = await usersStateRepository.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  };

  const getUserByAuthenticationId = async (
    authenticationProviderId: string,
  ) => {
    const user = await usersStateRepository.getUserByAuthenticationId(
      authenticationProviderId,
    );
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  };

  return {
    getUserByUserId,
    getUserByAuthenticationId,
  };
};
