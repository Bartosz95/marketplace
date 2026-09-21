import { AuthenticationProviderRepository } from "../repositories/authenticationProviderRepository";
import { UserStateRepository } from "../repositories/userStateRepository";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { Event, EventType } from "../types";

export const UserStateProcessManager =
  (
    eventSourceRepository: EventSourceRepository,
    userStateRepository: UserStateRepository,
    authenticationProviderRepository: AuthenticationProviderRepository,
  ) =>
  async (event: Event) => {
    const { eventType } = event;

    switch (eventType) {
      case EventType.USER_FIRST_REQUEST:
        const { authenticationProviderId } = event.data;
        const userCurrentState =
          await userStateRepository.getUserByAuthenticationId(
            authenticationProviderId,
          );
        if (userCurrentState) {
          console.log("User already exists in the database.");
          break;
        }

        console.log(event);

        console.log(authenticationProviderId);

        authenticationProviderRepository
          .getUser(authenticationProviderId)
          .then((user) => {
            console.log(user.data);
          });

        const response = await authenticationProviderRepository.getUser(
          authenticationProviderId,
        );

        const {
          name,
          email,
          nickname,
          email_verified: emailVerified,
        } = response.data;

        console.log("user from db");
        console.log({ name, email, nickname, email_verified: emailVerified });

        const id = event.streamId;

        await userStateRepository.createUser(
          id,
          authenticationProviderId,
          name,
          email,
        );

        await eventSourceRepository.insertEvent(EventType.USER_CREATED, {
          id,
          authenticationProviderId,
          name,
          email,
          nickname,
          emailVerified,
        });
    }
  };
