import { UUID } from "crypto";
import { ListingsStateRepository } from "../repositories/listingsStateRepository";
import {
  EventType,
  PurchaseRequestedEventData,
  ListingStatus,
} from "../types";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { SellerPaymentReadinessRepository } from "../repositories/sellerPaymentReadinessRepository";

export interface PurchaseDomain {
  purchaseRequested: (
    userId: UUID,
    listingId: UUID,
    authorization: string,
    buyerAuthenticationProviderId: string,
  ) => Promise<UUID>;
}

export class SellerPaymentsNotReadyError extends Error {}

export const PurchaseDomain = (
  listingsStateRepository: ListingsStateRepository,
  eventSourceRepository: EventSourceRepository,
  sellerPaymentReadinessRepository: SellerPaymentReadinessRepository,
): PurchaseDomain => {

  const purchaseRequested = async (
    userId: UUID,
    listingId: UUID,
    authorization: string,
    buyerAuthenticationProviderId: string,
  ): Promise<UUID> => {
    const listing = await listingsStateRepository.getListing(listingId);
    if (!listing) throw new Error(`listing undefined`);
    if (userId === listing.userId)
      throw Error(`User ${userId} requested to purchase its own item`);

    if (listing.status !== ListingStatus.ACTIVE)
      throw new Error(
        `Listing ${listingId} is not available for purchase. Current status: ${listing.status}`,
      );

    if (
      !(await sellerPaymentReadinessRepository.canReceivePayments(
        listing.userId,
        authorization,
      ))
    ) {
      throw new SellerPaymentsNotReadyError(
        `Seller ${listing.userId} has not completed Stripe onboarding`,
      );
    }

    const purchaseEventData: PurchaseRequestedEventData = {
      sellerId: listing.userId,
      buyerId: userId,
      buyerAuthenticationProviderId,
      price: listing.price,
      listingId,
      currency: "aud",
    };

    return eventSourceRepository.insertEvent(
      EventType.PURCHASE_REQUESTED,
      purchaseEventData,
    );
  };

  return {
    purchaseRequested,
  };
};
