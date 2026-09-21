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
    console.log("SynchronizeUserMiddleware called");
    console.log(JSON.stringify(req.auth));
    if (req.auth === undefined) return next();

    console.log(req.auth.payload);
    console.log(req.headers);
    const authenticationProviderId = req.auth.payload?.sub;
    console.log("Checking if user exists in the database...");
    const userExists = await userStateRepository.userExistsWithAuthenticationId(
      authenticationProviderId,
    );
    console.log("User exists:", userExists);

    if (userExists) return next();

    await eventSourceRepository.insertEvent(EventType.USER_FIRST_REQUEST, {
      authenticationProviderId: req.auth.payload?.sub,
    });
    console.log("User info fetched and event created.");
    next();
  };
