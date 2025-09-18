import { ListingsStateRepository } from "../repositories/listingsStateRepository";
import { Event, EventType, Listing } from "../types";

export const ListingStateProcessManager = (
  repository: ListingsStateRepository
): ((event: Event) => void) => {
  return (event: Event) => {
    const { eventType, listingId, createdAt, data } = event;

    switch (eventType) {
      case EventType.LISTING_CREATED:
        repository.createListing({
          ...data as Listing,
          listingId,
          status: EventType.LISTING_CREATED,
        });
        return;
      case EventType.LISTING_UPDATED:
        repository.updateListing(listingId, data as Listing, createdAt);
        return;
      case EventType.LISTING_DELETED:
      case EventType.LISTING_PURCHASED:
        repository.updateListingStatus(listingId, eventType, createdAt);
        return;
    }
  };
};
