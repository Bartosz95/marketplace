import { Router } from "express";
import { UUID } from "crypto";
import { userIdSchema, listingIdSchema } from "../libs/validationSchemas";
import { UsersDomain } from "../users-api/usersDomain";
import {
  PurchaseDomain,
  SellerPaymentsNotReadyError,
} from "./purchaseDomain";

export const PurchaseRouter = (
  listingsDomain: PurchaseDomain,
  userDomain: UsersDomain,
) => {
  const router = Router();

  router.post("/:listingId", async (req, res, next) => {
    try {
      const authenticationProviderId = userIdSchema.parse(
        req?.auth?.payload?.sub,
      );
      const listingId = listingIdSchema.parse(req.params.listingId) as UUID;
      const user = await userDomain.getUserByAuthenticationId(
        authenticationProviderId,
      );
      const authorization = req.header("authorization");
      if (!authorization) return res.sendStatus(401);
      const purchaseId = await listingsDomain.purchaseRequested(
        user.userId,
        listingId,
        authorization,
        authenticationProviderId,
      );
      res.status(202).send({ purchaseId });
    } catch (error) {
      if (error instanceof SellerPaymentsNotReadyError) {
        return res.status(409).send({ error: "seller_payments_not_ready" });
      }
      next(error);
    }
  });

  return router;
};
