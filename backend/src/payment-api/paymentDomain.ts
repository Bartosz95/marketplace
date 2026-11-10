import { UUID } from "crypto";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { EventType } from "../types";
import { StripeWebhookRepository } from "../repositories/stripeWebhookRepository";
import { PaymentProviderRepository } from "../repositories/paymentProviderRepository";
import { PaymentReconciliation } from "./paymentReconciliation";

export type CheckoutLookup =
  | { status: "pending" }
  | { status: "forbidden" }
  | { checkoutUrl: string };

export type PurchasePaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "forbidden";

export interface PaymentDomain {
  getCheckoutForBuyer: (
    purchaseId: UUID,
    buyerAuthenticationProviderId: string,
  ) => Promise<CheckoutLookup>;
  getPurchasePaymentStatus: (
    purchaseId: UUID,
    buyerAuthenticationProviderId: string,
  ) => Promise<PurchasePaymentStatus>;
  handleStripeWebhook: (
    payload: Buffer,
    signature: string,
  ) => Promise<"processed" | "ignored" | "duplicate" | "unknown_checkout">;
}

export const PaymentDomain = (
  eventSourceRepository: EventSourceRepository,
  stripeWebhookRepository: ReturnType<typeof StripeWebhookRepository>,
  paymentProvider: PaymentProviderRepository,
): PaymentDomain => {
  const paymentReconciliation = PaymentReconciliation(
    stripeWebhookRepository,
    paymentProvider,
  );

  const getCheckoutForBuyer = async (
    purchaseId: UUID,
    buyerAuthenticationProviderId: string,
  ): Promise<CheckoutLookup> => {
    const checkoutEvent = await eventSourceRepository.getLatestEventInStream(
      purchaseId,
      EventType.CHECKOUT_SESSION_CREATED,
    );
    if (!checkoutEvent) return { status: "pending" };
    if (
      checkoutEvent.eventType !== EventType.CHECKOUT_SESSION_CREATED ||
      checkoutEvent.data.buyerAuthenticationProviderId !==
        buyerAuthenticationProviderId
    ) {
      return { status: "forbidden" };
    }

    return { checkoutUrl: checkoutEvent.data.checkoutUrl };
  };

  const getPurchasePaymentStatus: PaymentDomain["getPurchasePaymentStatus"] =
    async (purchaseId, buyerAuthenticationProviderId) => {
      const checkoutEvent = await eventSourceRepository.getLatestEventInStream(
        purchaseId,
        EventType.CHECKOUT_SESSION_CREATED,
      );
      if (!checkoutEvent) return "pending";
      if (
        checkoutEvent.eventType !== EventType.CHECKOUT_SESSION_CREATED ||
        checkoutEvent.data.buyerAuthenticationProviderId !==
          buyerAuthenticationProviderId
      ) {
        return "forbidden";
      }

      return paymentReconciliation.reconcileCheckout(checkoutEvent);
    };

  const handleStripeWebhook: PaymentDomain["handleStripeWebhook"] = async (
    payload,
    signature,
  ) => {
    const event = stripeWebhookRepository.constructEvent(payload, signature);
    const succeeded =
      event.type === "checkout.session.async_payment_succeeded" ||
      (event.type === "checkout.session.completed" &&
        event.paymentStatus === "paid");
    const failed =
      event.type === "checkout.session.async_payment_failed" ||
      event.type === "checkout.session.expired";
    if (!succeeded && !failed) return "ignored";
    if (!event.sessionId) {
      throw new Error(`Stripe event ${event.id} has no Checkout Session ID`);
    }

    const checkoutEvent =
      await eventSourceRepository.getEventByCheckoutSessionId(event.sessionId);
    if (
      !checkoutEvent ||
      checkoutEvent.eventType !== EventType.CHECKOUT_SESSION_CREATED
    ) {
      return "unknown_checkout";
    }

    const inserted = await stripeWebhookRepository.appendEventOnce(
      event.id,
      checkoutEvent.streamId,
      succeeded ? EventType.PAYMENT_SUCCEEDED : EventType.PAYMENT_FAILED,
      succeeded
        ? { ...checkoutEvent.data, stripeEventId: event.id }
        : {
            ...checkoutEvent.data,
            stripeEventId: event.id,
            failureReason:
              event.type === "checkout.session.expired"
                ? "Checkout session expired"
                : "Checkout payment failed",
          },
      "webhook",
    );
    return inserted ? "processed" : "duplicate";
  };

  return {
    getCheckoutForBuyer,
    getPurchasePaymentStatus,
    handleStripeWebhook,
  };
};
