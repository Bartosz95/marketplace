import { Router } from "express";
import z from "zod";
import { UUID } from "crypto";
import { UsersDomain } from "./usersDomain";
import {
  AuthenticationUserNotFoundError,
  UserProvisioningDomain,
} from "./userProvisioningDomain";
import { UserPaymentDomain } from "./userPaymentDomain";

export const usersIdSchema = z.string();

export const UsersRouter = (
  userDomain: UsersDomain,
  userProvisioningDomain: UserProvisioningDomain,
  userPaymentDomain: UserPaymentDomain,
) => {
  const router = Router();

  router.get("/me", async (req, res, next) => {
    try {
      const authenticationProviderId = usersIdSchema.parse(
        req?.auth?.payload?.sub,
      );
      const userExists =
        await userProvisioningDomain.ensureUserExists(
          authenticationProviderId,
        );
      if (!userExists) {
        return res.status(202).send({ status: "provisioning" });
      }

      const user = await userDomain.getUserByAuthenticationId(
        authenticationProviderId,
      );
      return res.status(200).send(user);
    } catch (error) {
      if (error instanceof AuthenticationUserNotFoundError) {
        return res.sendStatus(404);
      }
      return next(error);
    }
  });

  router.post("/me/payment/onboarding-link", async (req, res) => {
    const authenticationProviderId = usersIdSchema.parse(
      req?.auth?.payload?.sub,
    );
    const responseBody = await userPaymentDomain.getOnboardingLink(
      authenticationProviderId,
    );
    return res.status(200).send(responseBody);
  });

  router.get("/me/payment/status", async (req, res) => {
    const authenticationProviderId = usersIdSchema.parse(
      req?.auth?.payload?.sub,
    );
    return res.send({
      status: await userPaymentDomain.getStatus(authenticationProviderId),
    });
  });

  router.get("/:userId/payment/readiness", async (req, res) => {
    const userId = z.uuid().parse(req.params.userId) as UUID;
    return res.send({
      status: (await userPaymentDomain.canReceivePayments(userId))
        ? "ready"
        : "not_ready",
    });
  });

  return router;
};
