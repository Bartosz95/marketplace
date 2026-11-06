import { AuthenticationProviderRepository } from "../repositories/authenticationProviderRepository";
import { UsersStateRepository } from "../repositories/usersStateRepository";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { Event, EventType } from "../types";

export const UserStateProcessManager =
  (
    eventSourceRepository: EventSourceRepository,
    usersStateRepository: UsersStateRepository,
    authenticationProviderRepository: AuthenticationProviderRepository,
  ) =>
  async (event: Event) => {
    const { eventType } = event;

    switch (eventType) {
      case EventType.USER_FIRST_REQUEST: {
        const { authenticationProviderId } = event.data;
        const userCurrentState =
          await usersStateRepository.getUserByAuthenticationId(
            authenticationProviderId,
          );
        if (userCurrentState) break;

        let { name, email, nickname, emailVerified } = event.data;
        if (!name || !email) {
          const response = await authenticationProviderRepository.getUser(
            authenticationProviderId,
          );
          if (!response) {
            throw new Error(
              `Auth0 user ${authenticationProviderId} was not found`,
            );
          }
          ({
            name,
            email,
            nickname,
            email_verified: emailVerified,
          } = response.data);
        }
        if (!name || !email) {
          throw new Error(
            `Auth0 user ${authenticationProviderId} is missing name or email`,
          );
        }

        const id = event.streamId;

        const userCreated = await usersStateRepository.createUser(
          id,
          authenticationProviderId,
          name,
          email,
        );

        if (!userCreated) break;

        await eventSourceRepository.insertEvent(EventType.USER_CREATED, {
          userId: id,
          authenticationProviderId,
          name,
          email,
          nickname,
          emailVerified,
        });
        break;
      }
      case EventType.PAYMENT_ACCOUNT_CREATED:
        await usersStateRepository.setPaymentProviderId(
          event.data.userId,
          event.data.paymentProviderId,
        );
        break;
    }
  };
