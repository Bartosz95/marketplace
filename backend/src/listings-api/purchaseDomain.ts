import { UUID } from "crypto";
import { ListingsStateRepository } from "../repositories/listingsStateRepository";
import {
  EventType,
  PurchaseRequestedEventData,
  ListingStatus,
} from "../types";
import { EventSourceRepository } from "../repositories/eventSourceRepository";

export interface PurchaseDomain {
  purchaseRequested: (userId: UUID, listing_id: UUID) => Promise<void>;
}

export const PurchaseDomain = (
  listingsStateRepository: ListingsStateRepository,
  eventSourceRepository: EventSourceRepository,
): PurchaseDomain => {

  const purchaseRequested = async (userId: UUID, listingId: UUID) => {
    const listing = await listingsStateRepository.getListing(listingId);
    if (!listing) throw new Error(`listing undefined`);
    if (userId === listing.userId)
      throw Error(`User ${userId} requested to purchase its own item`);

    if (listing.status !== ListingStatus.ACTIVE)
      throw new Error(
        `Listing ${listingId} is not available for purchase. Current status: ${listing.status}`,
      );

    const purchaseEventData: PurchaseRequestedEventData = {
      sellerId: listing.userId,
      buyerId: userId,
      price: listing.price,
      listingId,
      currency: "aud",
    };

    await eventSourceRepository.insertEventByStreamId(
      listingId,
      EventType.PURCHASE_REQUESTED,
      purchaseEventData,
    );
  };

  return {
    purchaseRequested,
  };
};
