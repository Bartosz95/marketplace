import { EventType, CheckoutSessionCreatedEvent } from "../types";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { PaymentProviderRepository } from "../repositories/paymentProviderRepository";
import { StripeWebhookRepository } from "../repositories/stripeWebhookRepository";

export type ReconciliationResult = "paid" | "failed" | "pending";

export const PaymentReconciliation = (
  stripeWebhookRepository: ReturnType<typeof StripeWebhookRepository>,
  paymentProvider: PaymentProviderRepository,
) => {
  const reconcileCheckout = async (
    checkoutEvent: CheckoutSessionCreatedEvent,
  ): Promise<ReconciliationResult> => {
    const sessionStatus = await paymentProvider.getCheckoutSessionStatus(
      checkoutEvent.data.checkoutSessionId,
    );
    const succeeded =
      sessionStatus.paymentStatus === "paid" ||
      sessionStatus.paymentStatus === "no_payment_required";
    const failed =
      sessionStatus.status === "expired" ||
      (sessionStatus.status === "complete" &&
        (sessionStatus.paymentIntentStatus === "requires_payment_method" ||
          sessionStatus.paymentIntentStatus === "canceled"));

    if (!succeeded && !failed) return "pending";

    const eventType = succeeded
      ? EventType.PAYMENT_SUCCEEDED
      : EventType.PAYMENT_FAILED;
    await stripeWebhookRepository.appendEventOnce(
      `reconcile:${checkoutEvent.data.checkoutSessionId}:${eventType}`,
      checkoutEvent.streamId,
      eventType,
      succeeded
        ? checkoutEvent.data
        : {
            ...checkoutEvent.data,
            failureReason:
              sessionStatus.status === "expired"
                ? "Checkout session expired"
                : "Checkout payment failed",
          },
      "reconciliation",
    );

    return succeeded ? "paid" : "failed";
  };

  const reconcilePendingCheckouts = async (
    eventSourceRepository: EventSourceRepository,
    batchSize: number,
    onError: (error: unknown, checkoutSessionId: string) => void,
    onResult: (result: ReconciliationResult | "error") => void,
  ): Promise<void> => {
    const checkoutEvents =
      await eventSourceRepository.getCheckoutEventsToReconcile(batchSize);
    for (const checkoutEvent of checkoutEvents) {
      let lastError: string | null = null;
      try {
        onResult(await reconcileCheckout(checkoutEvent));
      } catch (error) {
        onError(error, checkoutEvent.data.checkoutSessionId);
        onResult("error");
        lastError = error instanceof Error ? error.message : String(error);
      }
      await eventSourceRepository.recordCheckoutReconciliationAttempt(
        checkoutEvent.data.checkoutSessionId,
        checkoutEvent.streamId,
        lastError,
      );
    }
  };

  return { reconcileCheckout, reconcilePendingCheckouts };
};
