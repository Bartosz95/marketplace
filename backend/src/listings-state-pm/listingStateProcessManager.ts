import { ListingsStateRepository } from "../repositories/listingsStateRepository";
import { Event, EventType, ListingState } from "../types";

export const ListingsStateProcessManager =
  (listingStateRepository: ListingsStateRepository) => async (event: Event) => {
    const { eventType, streamId } = event;
    const previousState = await listingStateRepository.getListingById(streamId);

    switch (eventType) {
      case EventType.LISTING_CREATED:
        const created: ListingState = {
          ...event.data,
          imagesUrls: [],
          listingId: streamId,
          status: EventType.LISTING_CREATED,
          modifiedAt: event.createdAt,
          version: event.version,
        };
        await listingStateRepository.updateListing(created);
        break;
      case EventType.LISTING_UPDATED:
        if (!previousState) throw new Error(`previousState undefined`);
        const updated: ListingState = {
          ...previousState,
          ...event.data,
          status: EventType.LISTING_UPDATED,
        };
        await listingStateRepository.updateListing(updated);
        break;
      case EventType.LISTING_PURCHASED:
        if (!previousState) throw new Error(`previousState undefined`);
        const purchased: ListingState = {
          ...previousState,
          status: EventType.LISTING_PURCHASED,
        };
        await listingStateRepository.updateListing(purchased);
        break;
      case EventType.LISTING_ARCHIVED:
      case EventType.LISTING_DELETED:
        if (!previousState) throw new Error(`previousState undefined`);
        const archived: ListingState = {
          ...previousState,
          status: eventType,
        };
        await listingStateRepository.updateListing(archived);
        break;
      case EventType.IMAGES_UPLOADED:
        if (!previousState) throw new Error(`previousState undefined`);
        const imagesUrls = event.data.imagesUrls;
        const imagesUploaded: ListingState = {
          ...previousState,
          imagesUrls,
        };
        await listingStateRepository.updateListing(imagesUploaded);
        break;
    }
  };
