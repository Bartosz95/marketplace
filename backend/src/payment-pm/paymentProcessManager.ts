import { PaymentProviderRepository } from "../repositories/paymentProviderRepository";
import { Event, EventType } from "../types";

export const PaymentProcessManager =
  (paymentProvider: PaymentProviderRepository) => async (event: Event) => {
    const { eventType } = event;
    switch (eventType) {
      case EventType.LISTING_CREATED:
        const created_id = event.streamId;
        const created_name = event.data.title;
        const created_price = event.data.price;
        await paymentProvider.createProduct(
          created_id,
          created_name,
          created_price
        );
        break;
      case EventType.LISTING_UPDATED:
        const updated_id = event.streamId;
        const updated_name = event.data.title;
        const updated_price = event.data.price;
        await paymentProvider.updateProduct(
          updated_id,
          updated_name,
          updated_price
        );
        break;
    }
  };
