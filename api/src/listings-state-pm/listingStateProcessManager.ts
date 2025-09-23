import { ListingsStateRepository } from "../repositories/listingsStateRepository";
import { Event, EventType, Listing } from "../types";

export const ListingStateProcessManager =
  (listingStateRepository: ListingsStateRepository) => async (event: Event) => {
    const { eventType, listingId, createdAt } = event;
    if (eventType === EventType.LISTING_CREATED) {
      const listingCreatedState: Listing = {
        listingId,
        ownerId: event.data.ownerId,
        modifiedAt: createdAt,
        status: EventType.LISTING_CREATED,
        title: event.data.title,
        description: event.data.description,
        price: event.data.price,
        imagesUrls: [],
      };
      await listingStateRepository.createListing(listingCreatedState);
      return;
    }
    const previousState = await listingStateRepository.getListingById(
      listingId
    );
    if (
      previousState === null ||
      (previousState.status !== EventType.LISTING_CREATED &&
        previousState.status !== EventType.LISTING_UPDATED)
    )
      throw new Error(`Cannot update a state of Listing`);

    switch (eventType) {
      case EventType.LISTING_UPDATED:
        const listingUpdatedState: Listing = {
          listingId,
          modifiedAt: createdAt,
          status: EventType.LISTING_UPDATED,
          ownerId: previousState.ownerId,
          title: event.data.title || previousState.title,
          description: event.data.description || previousState.description,
          price: event.data.price || previousState.price,
          imagesUrls: previousState.imagesUrls,
        };
        await listingStateRepository.updateListing(listingUpdatedState);
        return;
      case EventType.LISTING_DELETED:
      case EventType.LISTING_PURCHASED:
        const updatedState: Listing = {
          ...previousState,
          listingId,
          status: eventType,
        };
        await listingStateRepository.updateListing(updatedState);
        break;
      case EventType.IMAGES_UPLOADED:
        const imagesUrls = event.data.imagesUrls;
        const imagesUploaded: Listing = {
          ...previousState,
          listingId,
          imagesUrls,
        };
        await listingStateRepository.updateListing(imagesUploaded);
        break;
    }
  };
