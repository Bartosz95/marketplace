import { Request, Response, NextFunction } from "express";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { EventType } from "../types";
import { UsersStateRepository } from "../repositories/usersStateRepository";

export const SynchronizeUserMiddleware =
  (
    usersStateRepository: UsersStateRepository,
    eventSourceRepository: EventSourceRepository,
  ) =>
  async (req: Request, _: Response, next: NextFunction) => {
    if (req.auth === undefined) return next();
    const authenticationProviderId = req.auth.payload?.sub;
    const userExists =
      await usersStateRepository.userExistsWithAuthenticationId(
        authenticationProviderId,
      );

    if (userExists) return next();
    await eventSourceRepository.insertEvent(EventType.USER_FIRST_REQUEST, {
      authenticationProviderId: req.auth.payload?.sub,
    });
    next();
  };
