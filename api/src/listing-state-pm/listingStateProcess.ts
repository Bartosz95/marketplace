import { ListingsStateRepository } from "../repositories/listingsStateRepository";
import { Event, EventType } from "../types";

export const ListingStateProcessManager = (
  repository: ListingsStateRepository
): ((event: Event) => void) => {
  return (event: Event) => {
    const { eventType, listingId, data, createdAt } = event;

    switch (eventType) {
      case EventType.LISTING_CREATED:
        repository.createListing({
          ...data,
          status: EventType.LISTING_CREATED,
        });
        return;
      case EventType.LISTING_UPDATED:
        repository.updateListing(listingId, data, createdAt);
        return;
      case EventType.LISTING_DELETED:
      case EventType.LISTING_PURCHASED:
        repository.updateListingStatus(listingId, eventType, createdAt);
        return;
    }
  };
};
