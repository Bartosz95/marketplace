import { ListingsStateRepository } from "../repositories/listingsStateRepository";
import { Event, EventType, ListingState } from "../types";

export const ListingStateProcessManager =
  (listingStateRepository: ListingsStateRepository) => async (event: Event) => {
    const { eventType, streamId, createdAt } = event;
    if (eventType === EventType.LISTING_CREATED) {
      const listingCreatedState: ListingState = {
        listingId: streamId,
        userId: event.data.userId,
        modifiedAt: createdAt,
        status: EventType.LISTING_CREATED,
        version: 1,
        title: event.data.title,
        description: event.data.description,
        price: event.data.price,
        imagesUrls: [],
      };
      await listingStateRepository.createListing(listingCreatedState);
      return;
    }
    const previousState = await listingStateRepository.getListingById(streamId);

    switch (eventType) {
      case EventType.LISTING_UPDATED:
        const listingUpdatedState: ListingState = {
          listingId: streamId,
          modifiedAt: createdAt,
          status: EventType.LISTING_UPDATED,
          version: previousState.version + 1,
          userId: previousState.userId,
          title: event.data.title || previousState.title,
          description: event.data.description || previousState.description,
          price: event.data.price || previousState.price,
          imagesUrls: previousState.imagesUrls,
        };
        await listingStateRepository.updateListing(listingUpdatedState);
        return;
      case EventType.LISTING_PURCHASED:
      case EventType.LISTING_ARCHIVED:
      case EventType.LISTING_DELETED:
        const updatedState: ListingState = {
          ...previousState,
          status: eventType,
        };
        await listingStateRepository.updateListing(updatedState);
        break;
      case EventType.IMAGES_UPLOADED:
        const imagesUrls = event.data.imagesUrls;
        const imagesUploaded: ListingState = {
          ...previousState,
          imagesUrls,
        };
        await listingStateRepository.updateListing(imagesUploaded);
        break;
    }
  };
