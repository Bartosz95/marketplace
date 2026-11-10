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
    const currentState = await listingStateRepository.getListing(listingId);

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
        if (!currentState) throw new Error(`currentState undefined`);
        if (
          event.data.status === ListingStatus.ARCHIVED &&
          (currentState.status === ListingStatus.SOLD ||
            currentState.status === ListingStatus.RESERVED ||
            currentState.status === ListingStatus.DELETED)
        ) {
          throw new Error(
            `Cannot archive listing ${listingId} because it is ${currentState.status}`,
          );
        }
        const updated: ListingState = {
          ...currentState,
          ...event.data,
        };
        await listingStateRepository.updateListing(updated);
        break;
      }
      case EventType.IMAGES_UPLOADED: {
        if (!currentState) throw new Error(`currentState undefined`);
        const imagesUrls = event.data.imagesUrls;
        const imagesUploaded: ListingState = {
          ...currentState,
          imagesUrls,
        };
        await listingStateRepository.updateListing(imagesUploaded);
        break;
      }
      case EventType.PURCHASE_REQUESTED:
        if (!currentState) throw new Error(`currentState undefined`);
        await listingStateRepository.updateListingStatus(
          listingId,
          ListingStatus.RESERVED,
          createdAt,
        );
        break;
      case EventType.PAYMENT_SUCCEEDED:
      case EventType.LISTING_PURCHASED:
        if (!currentState) throw new Error(`currentState undefined`);
        await listingStateRepository.updateListingStatus(
          listingId,
          ListingStatus.SOLD,
          createdAt,
        );
        break;
      case EventType.PAYMENT_FAILED:
        if (!currentState) throw new Error(`currentState undefined`);
        if (currentState.status === ListingStatus.RESERVED) {
          await listingStateRepository.updateListingStatus(
            listingId,
            ListingStatus.ACTIVE,
            createdAt,
          );
        }
        break;
      case EventType.LISTING_DELETED: {
        if (!currentState) throw new Error(`currentState undefined`);
        if (currentState.status === ListingStatus.DELETED) {
          throw new Error(
            `Cannot delete listing ${listingId} because its status is: ${currentState.status}`,
          );
        }
        if (currentState.status === ListingStatus.SOLD) {
          throw new Error(
            `Cannot delete listing ${listingId} because it has been sold`,
          );
        }
        if (currentState.status === ListingStatus.RESERVED) {
          throw new Error(
            `Cannot delete listing ${listingId} because it is reserved`,
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
