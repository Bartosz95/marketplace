import { ListingsStateRepository } from "../repositories/listingsStateRepository";
import { Event, EventType, ListingState, ListingStatus } from "../types";

export const ListingsStateProcessManager =
  (listingStateRepository: ListingsStateRepository) => async (event: Event) => {
    const { eventType, streamId, createdAt } = event;
    const previousState = await listingStateRepository.getListing(streamId);
    console.log(event);

    switch (eventType) {
      case EventType.LISTING_CREATED:
        const created: ListingState = {
          ...event.data,
          imagesUrls: [],
          paymentLink: "",
          listingId: streamId,
          status: ListingStatus.ACTIVE,
          modifiedAt: createdAt,
          version: event.version,
        };
        await listingStateRepository.updateListing(created);
        break;
      case EventType.LISTING_UPDATED:
        if (!previousState) throw new Error(`previousState undefined`);
        const updated: ListingState = {
          ...previousState,
          ...event.data,
        };
        await listingStateRepository.updateListing(updated);
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
      case EventType.LISTING_DELETED:
        if (!previousState) throw new Error(`previousState undefined`);
        if (previousState.status === ListingStatus.DELETED) {
          throw new Error(
            `Cannot delete listing ${streamId} because its status is: ${previousState.status}`,
          );
        }

        await listingStateRepository.updateListingStatus(
          streamId,
          ListingStatus.DELETED,
          createdAt,
        );
        break;
    }
  };
