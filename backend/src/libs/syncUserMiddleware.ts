import { Request, Response, NextFunction } from "express";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { EventType } from "../types";
import { UserStateRepository } from "../repositories/userStateRepository";

export const SynchronizeUserMiddleware =
  (
    userStateRepository: UserStateRepository,
    eventSourceRepository: EventSourceRepository,
  ) =>
  async (req: Request, _: Response, next: NextFunction) => {
    if (req.auth === undefined) return next();
    const authenticationProviderId = req.auth.payload?.sub;
    const userExists = await userStateRepository.userExistsWithAuthenticationId(
      authenticationProviderId,
    );

    if (userExists) return next();
    await eventSourceRepository.insertEvent(EventType.USER_FIRST_REQUEST, {
      authenticationProviderId: req.auth.payload?.sub,
    });
    next();
  };
