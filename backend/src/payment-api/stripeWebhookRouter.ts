import { Router } from "express";
import { PaymentDomain } from "./paymentDomain";

export const StripeWebhookRouter = (paymentDomain: PaymentDomain) => {
  const router = Router();
  router.post("/", async (req, res, next) => {
    try {
      const signature = req.header("stripe-signature");
      if (!signature) return res.status(400).send("Missing Stripe signature");

      const result = await paymentDomain.handleStripeWebhook(
        req.body as Buffer,
        signature,
      );
      if (result === "unknown_checkout") {
        return res.status(404).send("Unknown Checkout Session");
      }
      return res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  });
  return router;
};
