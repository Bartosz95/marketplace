import { PurchasesStateRepository } from "../repositories/purchasesStateRepository";
import { Event, EventType, PurchaseState } from "../types";

export const PurchasesStateProcessManager =
  (purchasesStateRepository: PurchasesStateRepository) => async (event: Event) => {
    const { eventType,  } = event;

    switch (eventType) {
      case EventType.LISTING_PURCHASED:
        const purchase: PurchaseState = {
          listingId: event.streamId,
          sellerId: event.data.sellerId,
          buyerId: event.data.buyerId,
          price: event.data.price,
          modifiedAt: event.createdAt,
          status: EventType.LISTING_PURCHASED,
          version: 1
        }
        await purchasesStateRepository.updatePurchase(purchase);
        break;
    }
  };
