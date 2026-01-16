import { UUID } from "crypto";
import { UserStateRepository } from "../repositories/userStateRepository";
import { PaymentProviderRepository } from "../repositories/paymentProviderRepository";

export interface UserState {
  id: UUID;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: string;
  address: Address;
  paymentId: string;
  authId: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface UserDomain {
  createUser: (
    name: string,
    email: string,
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string,
  ) => Promise<void>;
  updateUser: (
    id: UUID,
    name?: string,
    email?: string,
    street?: string,
    city?: string,
    state?: string,
    zipCode?: string,
    country?: string,
  ) => Promise<void>;
  getUser: (
    userId: UUID
  ) => Promise<UserState | undefined>;
}

export const UserDomain = (
  userStateRepository: UserStateRepository,
  paymentProviderRepository: PaymentProviderRepository,
  authenticationProviderRepository: AuthenticationProviderRepository,
): UserDomain => {

  const createUser = async (
    name: string,
    email: string,
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string,
  ): Promise<void> => {
    const authId = await authenticationProviderRepository.createUser(
      name,
      email,
    );
    const paymentId = await paymentProviderRepository.createUser(name, email);
    await userStateRepository.createUser(name, email, street, city, state, zipCode, country, paymentId, authId);
  };

  const updateUser = async (
    id: UUID,
    name?: string,
    email?: string,
    street?: string,
    city?: string,
    state?: string,
    zipCode?: string,
    country?: string,
  ): Promise<void> => {
    const user = await userStateRepository.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    await authenticationProviderRepository.updateUser(
      user.authId,
      name,
      email,
    );
    await paymentProviderRepository.updateUser(
      user.paymentId,
      name,
      email,
    );

    const updatedUserDetails: UserState = {
      ...user,
      name: name ?? user.name,
      email: email ?? user.email,
      address: {
        street: street ?? user.address.street,
        city: city ?? user.address.city,
        state: state ?? user.address.state,
        zipCode: zipCode ?? user.address.zipCode,
        country: country ?? user.address.country,
      },
    };
    await userStateRepository.updateUser(updatedUserDetails);
  };

  const getUser = async (
    userId: UUID
  ): Promise<User | undefined> => {
    return await userStateRepository.getUser(userId);
  };

  return {
    createUser,
    updateUser,
    getUser
  };
};
