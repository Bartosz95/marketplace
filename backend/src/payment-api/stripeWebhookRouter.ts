import { Router } from "express";
import Stripe from "stripe";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { StripeWebhookRepository } from "../repositories/stripeWebhookRepository";
import { EventType } from "../types";

export const StripeWebhookRouter = (
  stripe: Stripe,
  webhookSecret: string,
  eventSourceRepository: EventSourceRepository,
  webhookRepository: ReturnType<typeof StripeWebhookRepository>,
) => {
  const router = Router();
  router.post("/", async (req, res, next) => {
    try {
      const signature = req.header("stripe-signature");
      if (!signature) return res.status(400).send("Missing Stripe signature");
      const event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
      if (!(await webhookRepository.claim(event.id))) return res.sendStatus(200);

      if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
        const session = event.data.object as Stripe.Checkout.Session;
        const checkoutEvent = await eventSourceRepository.getEventByCheckoutSessionId(session.id);
        if (!checkoutEvent || checkoutEvent.eventType !== EventType.CHECKOUT_SESSION_CREATED) {
          return res.status(404).send("Unknown Checkout Session");
        }
        await eventSourceRepository.insertEventByStreamId(checkoutEvent.streamId, EventType.PAYMENT_SUCCEEDED, {
          ...checkoutEvent.data,
          stripeEventId: event.id,
        });
      }
      return res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  });
  return router;
};
