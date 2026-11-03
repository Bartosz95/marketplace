import { Router } from "express";
import { UUID } from "crypto";
import { userIdSchema, listingIdSchema } from "../libs/validationSchemas";
import { UsersDomain } from "../users-api/usersDomain";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { CheckoutSessionCreatedEvent, EventType } from "../types";
import { PurchaseDomain } from "./purchaseDomain";

export const ListingsWriteRouter = (
  listingsDomain: PurchaseDomain,
  userDomain: UsersDomain,
  eventSourceRepository: EventSourceRepository,
) => {
  const router = Router();

  router.post("/:listingId", async (req, res) => {
    const authenticationProviderId = userIdSchema.parse(
      req?.auth?.payload?.sub,
    );
    const listingId = listingIdSchema.parse(req.params.listingId) as UUID;
    const user = await userDomain.getUserByAuthenticationId(
      authenticationProviderId,
    );
    const purchaseId = await listingsDomain.purchaseRequested(
      user.userId,
      listingId,
    );
    res.status(202).send({ purchaseId });
  });

  router.get("/purchases/:purchaseId/checkout", async (req, res) => {
    const authenticationProviderId = userIdSchema.parse(req.auth?.payload?.sub);
    const user = await userDomain.getUserByAuthenticationId(
      authenticationProviderId,
    );
    const purchaseId = listingIdSchema.parse(req.params.purchaseId) as UUID;

    const checkoutEvent = await eventSourceRepository.getLatestEventInStream(
      purchaseId,
      EventType.CHECKOUT_SESSION_CREATED,
    );
    if (!checkoutEvent) return res.status(202).send({ status: "pending" });
    const checkout = checkoutEvent as CheckoutSessionCreatedEvent;
    if (checkout.data.buyerId !== user.userId) return res.sendStatus(403);
    return res.send({ checkoutUrl: checkout.data.checkoutUrl });
  });

  return router;
};
