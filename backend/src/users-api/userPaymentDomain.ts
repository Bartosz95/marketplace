import { UUID } from "crypto";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { PaymentProviderRepository } from "../repositories/paymentProviderRepository";
import { UsersStateRepository } from "../repositories/usersStateRepository";
import { EventType } from "../types";

export interface UserPaymentDomain {
  getOnboardingLink: (
    authenticationProviderId: string,
  ) => Promise<{ onboardingUrl: string }>;
  getStatus: (
    authenticationProviderId: string,
  ) => Promise<"not_started" | "pending" | "onboarding_required" | "ready">;
  canReceivePayments: (userId: UUID) => Promise<boolean>;
}

export const UserPaymentDomain = (
  usersStateRepository: UsersStateRepository,
  eventSourceRepository: EventSourceRepository,
  paymentProvider: PaymentProviderRepository,
): UserPaymentDomain => {
  const getPaymentAccountId = async (userId: UUID, existingId?: string) => {
    if (existingId) return existingId;
    const accountCreatedEvent =
      await eventSourceRepository.getLatestEventInStream(
        userId,
        EventType.PAYMENT_ACCOUNT_CREATED,
      );
    return accountCreatedEvent?.eventType === EventType.PAYMENT_ACCOUNT_CREATED
      ? accountCreatedEvent.data.paymentProviderId
      : undefined;
  };

  const getOnboardingLink = async (authenticationProviderId: string) => {
    const user = await usersStateRepository.getUserByAuthenticationId(
      authenticationProviderId,
    );
    if (!user) throw new Error("User not found");
    let paymentProviderId = await getPaymentAccountId(
      user.userId,
      user.paymentProviderId,
    );
    if (!paymentProviderId) {
      paymentProviderId = await paymentProvider.createConnectedAccount(
        user.email,
        `connect-account:${user.userId}`,
      );
      await eventSourceRepository.insertEventByStreamId(
        user.userId,
        EventType.PAYMENT_ACCOUNT_CREATED,
        { userId: user.userId, paymentProviderId },
      );
    }

    return {
      onboardingUrl: await paymentProvider.createAccountOnboardingLink(
        paymentProviderId,
      ),
    };
  };

  const getStatus: UserPaymentDomain["getStatus"] = async (
    authenticationProviderId,
  ) => {
    const user = await usersStateRepository.getUserByAuthenticationId(
      authenticationProviderId,
    );
    if (!user) throw new Error("User not found");
    const paymentProviderId = await getPaymentAccountId(
      user.userId,
      user.paymentProviderId,
    );
    if (!paymentProviderId) {
      const requestEvent = await eventSourceRepository.getLatestEventInStream(
        user.userId,
        EventType.PAYMENT_ACCOUNT_REQUESTED,
      );
      return requestEvent ? "pending" : "not_started";
    }

    return (await paymentProvider.canReceiveTransfers(paymentProviderId))
      ? "ready"
      : "onboarding_required";
  };

  const canReceivePayments = async (userId: UUID) => {
    const user = await usersStateRepository.getUser(userId);
    if (!user) return false;
    const paymentProviderId = await getPaymentAccountId(
      userId,
      user.paymentProviderId,
    );
    return paymentProviderId
      ? paymentProvider.canReceiveTransfers(paymentProviderId)
      : false;
  };

  return { getOnboardingLink, getStatus, canReceivePayments };
};
