import { PurchasesStateRepository } from "../repositories/purchasesStateRepository";
import { Event, EventType, PurchaseState, PurchaseStatus } from "../types";

export const PurchasesStateProcessManager =
  (purchasesStateRepository: PurchasesStateRepository) =>
  async (event: Event) => {
    const { eventType } = event;

    console.log(event);
    switch (eventType) {
      case EventType.PURCHASE_REQUESTED:
        const purchase: PurchaseState = {
          listingId: event.streamId,
          sellerId: event.data.sellerId,
          buyerId: event.data.buyerId,
          price: event.data.price,
          modifiedAt: event.createdAt,
          status: PurchaseStatus.REQUESTED,
          version: 1,
        };
        console.log(purchase);
        await purchasesStateRepository.updatePurchase(purchase);
        break;
    }
  };
