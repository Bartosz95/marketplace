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
      case EventType.USER_FIRST_REQUEST:
        console.log("UserStateProcessManager");
        console.log(event);
        const { authenticationProviderId } = event.data;
        const userCurrentState =
          await usersStateRepository.getUserByAuthenticationId(
            authenticationProviderId,
          );
        if (userCurrentState) {
          console.log("User already exists in the database.");
          break;
        }
        console.log("User not found in the database.");
        console.log({ userCurrentState });

        const response = await authenticationProviderRepository.getUser(
          authenticationProviderId,
        );

        if (!response) {
          throw new Error(
            `Auth0 user ${authenticationProviderId} was not found`,
          );
        }

        const {
          name,
          email,
          nickname,
          email_verified: emailVerified,
        } = response.data;

        const id = event.streamId;

        const userCreated = await usersStateRepository.createUser(
          id,
          authenticationProviderId,
          name,
          email,
        );

        if (!userCreated) break;

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
