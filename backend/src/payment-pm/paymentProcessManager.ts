import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { PaymentProviderRepository } from "../repositories/paymentProviderRepository";
import { UsersStateRepository } from "../repositories/usersStateRepository";
import { Event, EventType } from "../types";

export const PaymentProcessManager =
  (
    paymentProvider: PaymentProviderRepository,
    eventSourceRepository: EventSourceRepository,
    usersStateRepository: UsersStateRepository,
  ) =>
  async (event: Event) => {
    const { eventType } = event;
    switch (eventType) {
      case EventType.PURCHASE_REQUESTED: {
        const buyer = await usersStateRepository.getUserByAuthenticationId(
          event.data.buyerAuthenticationProviderId,
        );
        if (!buyer) {
          throw new Error(
            `Buyer ${event.data.buyerAuthenticationProviderId} was not found`,
          );
        }
        const sellerAccountId = await usersStateRepository.getPaymentProviderId(
          event.data.sellerId,
        );
        if (!sellerAccountId) {
          throw new Error(
            `Seller ${event.data.sellerId} has no connected Stripe account`,
          );
        }
        if (!(await paymentProvider.canReceiveTransfers(sellerAccountId))) {
          throw new Error(
            `Seller ${event.data.sellerId} cannot receive Stripe transfers`,
          );
        }
        const checkout = await paymentProvider.createCheckoutSession(
          event.streamId,
          event.data,
          sellerAccountId,
          buyer.email,
          `checkout:${event.position}`,
        );
        await eventSourceRepository.insertEventByStreamId(
          event.streamId,
          EventType.CHECKOUT_SESSION_CREATED,
          { ...event.data, ...checkout },
        );
        break;
      }
    }
  };
