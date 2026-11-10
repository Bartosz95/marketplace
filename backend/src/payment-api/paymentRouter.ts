import { Router } from "express";
import { UUID } from "crypto";
import { listingIdSchema, userIdSchema } from "../libs/validationSchemas";
import { PaymentDomain } from "./paymentDomain";

export const PaymentRouter = (paymentDomain: PaymentDomain) => {
  const router = Router();

  router.get("/purchases/:purchaseId/checkout", async (req, res, next) => {
    try {
      const buyerAuthenticationProviderId = userIdSchema.parse(
        req.auth?.payload?.sub,
      );
      const purchaseId = listingIdSchema.parse(
        req.params.purchaseId,
      ) as UUID;
      const checkout = await paymentDomain.getCheckoutForBuyer(
        purchaseId,
        buyerAuthenticationProviderId,
      );
      if ("status" in checkout && checkout.status === "pending") {
        return res.status(202).send(checkout);
      }
      if ("status" in checkout && checkout.status === "forbidden") {
        return res.sendStatus(403);
      }
      return res.send(checkout);
    } catch (error) {
      next(error);
    }
  });

  router.get("/purchases/:purchaseId/status", async (req, res, next) => {
    try {
      const buyerAuthenticationProviderId = userIdSchema.parse(
        req.auth?.payload?.sub,
      );
      const purchaseId = listingIdSchema.parse(
        req.params.purchaseId,
      ) as UUID;
      const status = await paymentDomain.getPurchasePaymentStatus(
        purchaseId,
        buyerAuthenticationProviderId,
      );
      if (status === "forbidden") return res.sendStatus(403);
      return res.send({ status });
    } catch (error) {
      next(error);
    }
  });

  return router;
};
