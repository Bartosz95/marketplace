import { ListingsStateRepository } from "../repositories/listingsStateRepository";
import { Event, EventType, ListingState, ListingStatus } from "../types";

export const ListingsStateProcessManager =
  (listingStateRepository: ListingsStateRepository) => async (event: Event) => {
    const { eventType, streamId, createdAt } = event;
    const listingId =
      eventType === EventType.PURCHASE_REQUESTED ||
      eventType === EventType.PAYMENT_SUCCEEDED ||
      eventType === EventType.PAYMENT_FAILED
        ? event.data.listingId
        : streamId;
    const previousState = await listingStateRepository.getListing(listingId);
    console.log(event);

    switch (eventType) {
      case EventType.LISTING_CREATED: {
        const created: ListingState = {
          ...event.data,
          imagesUrls: [],
          listingId,
          status: ListingStatus.ACTIVE,
          modifiedAt: createdAt,
          version: event.version,
        };
        await listingStateRepository.updateListing(created);
        break;
      }
      case EventType.LISTING_UPDATED: {
        if (!previousState) throw new Error(`previousState undefined`);
        const updated: ListingState = {
          ...previousState,
          ...event.data,
        };
        await listingStateRepository.updateListing(updated);
        break;
      }
      case EventType.IMAGES_UPLOADED: {
        if (!previousState) throw new Error(`previousState undefined`);
        const imagesUrls = event.data.imagesUrls;
        const imagesUploaded: ListingState = {
          ...previousState,
          imagesUrls,
        };
        await listingStateRepository.updateListing(imagesUploaded);
        break;
      }
      case EventType.PURCHASE_REQUESTED:
        if (!previousState) throw new Error(`previousState undefined`);
        await listingStateRepository.updateListingStatus(
          listingId,
          ListingStatus.RESERVED,
          createdAt,
        );
        break;
      case EventType.PAYMENT_SUCCEEDED:
        if (!previousState) throw new Error(`previousState undefined`);
        await listingStateRepository.updateListingStatus(
          listingId,
          ListingStatus.SOLD,
          createdAt,
        );
        break;
      case EventType.PAYMENT_FAILED:
        if (!previousState) throw new Error(`previousState undefined`);
        if (previousState.status === ListingStatus.RESERVED) {
          await listingStateRepository.updateListingStatus(
            listingId,
            ListingStatus.ACTIVE,
            createdAt,
          );
        }
        break;
      case EventType.LISTING_DELETED: {
        if (!previousState) throw new Error(`previousState undefined`);
        if (previousState.status === ListingStatus.DELETED) {
          throw new Error(
            `Cannot delete listing ${listingId} because its status is: ${previousState.status}`,
          );
        }

        await listingStateRepository.updateListingStatus(
          listingId,
          ListingStatus.DELETED,
          createdAt,
        );
        break;
      }
    }
  };
