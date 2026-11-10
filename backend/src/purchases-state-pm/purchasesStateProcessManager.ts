import { PurchasesStateRepository } from "../repositories/purchasesStateRepository";
import { Event, EventType, PurchaseState, PurchaseStatus } from "../types";

export const PurchasesStateProcessManager =
  (purchasesStateRepository: PurchasesStateRepository) =>
  async (event: Event) => {
    const { eventType } = event;

    switch (eventType) {
      case EventType.PURCHASE_REQUESTED: {
        const purchase: PurchaseState = {
          purchaseId: event.streamId,
          listingId: event.data.listingId,
          sellerId: event.data.sellerId,
          buyerId: event.data.buyerId,
          price: event.data.price,
          modifiedAt: event.createdAt,
          status: PurchaseStatus.REQUESTED,
          version: 1,
        };
        await purchasesStateRepository.updatePurchase(purchase);
        break;
      }
      case EventType.CHECKOUT_SESSION_CREATED:
        await purchasesStateRepository.updatePurchaseStatus(
          event.streamId,
          PurchaseStatus.CHECKOUT_CREATED,
          event.createdAt,
        );
        break;
      case EventType.PAYMENT_SUCCEEDED:
        await purchasesStateRepository.updatePurchaseStatus(
          event.streamId,
          PurchaseStatus.COMPLETED,
          event.createdAt,
        );
        break;
      case EventType.PAYMENT_FAILED:
        await purchasesStateRepository.updatePurchaseStatus(
          event.streamId,
          PurchaseStatus.FAILED,
          event.createdAt,
        );
        break;
    }
  };
