import { UUID } from "crypto";
import { Logger } from "winston";
import { ListingsStateRepository } from "../repositories/listingsStateRepository";
import {
  EventType,
  FilterBy,
  Listing,
  ListingCreatedEvent,
  ListingDeletedEvent,
  ListingPurchasedEvent,
  ListingUpdatedEvent,
} from "../types";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import {
  CreateListingReqBody,
  UpdateListingReqBody,
} from "./listingsWriteRouter";

export interface ListingsDomain {
  createListing: (userId: string, data: CreateListingReqBody) => Promise<UUID>;
  getListings: (limit?: number, offset?: number) => Promise<Listing[]>;
  getUserListings: (
    userId: string,
    filter: FilterBy,
    limit?: number,
    offset?: number
  ) => Promise<Listing[]>;
  updateListing: (
    userId: string,
    listing_id: UUID,
    data: UpdateListingReqBody
  ) => Promise<void>;
  purchaseListing: (listing_id: UUID) => Promise<void>;
  deleteListing: (listing_id: UUID) => Promise<void>;
}

export const ListingsDomain = (
  listingsStateRepository: ListingsStateRepository,
  eventSourceRepository: EventSourceRepository,
  logger: Logger
): ListingsDomain => {
  const createListing = async (userId: string, data: CreateListingReqBody) => {
    const listingCreateEventData: ListingCreatedEvent = {
      listingId: crypto.randomUUID(), // will be replaced in db
      eventType: EventType.LISTING_CREATED,
      data: {
        userId,
        title: data.title,
        description: data.description,
        price: data.price,
      },
      position: 1,
      version: 1,
      createdAt: new Date(),
      metadata: {},
    };
    return await eventSourceRepository.insertEvent(listingCreateEventData);
  };

  const getListings = async (limit = 10, offset = 0): Promise<Listing[]> => {
    const statuses: EventType[] = [
      EventType.LISTING_CREATED,
      EventType.LISTING_UPDATED,
    ];
    const listings = await listingsStateRepository.getListings(
      statuses,
      limit,
      offset
    );
    return listings;
  };

  const getUserListings = async (
    userId: string,
    filter: FilterBy,
    limit = 10,
    offset = 0
  ): Promise<Listing[]> => {
    let statuses: EventType[] = [];
    switch (filter) {
      case FilterBy.All:
        statuses.push(EventType.LISTING_CREATED);
        statuses.push(EventType.LISTING_UPDATED);
        statuses.push(EventType.LISTING_PURCHASED);
        statuses.push(EventType.LISTING_DELETED);
        break;
      case FilterBy.Sold:
        statuses.push(EventType.LISTING_PURCHASED);
        break;
      case FilterBy.Deleted:
        statuses.push(EventType.LISTING_DELETED);
        break;
    }

    const listings = await listingsStateRepository.getListingsByUserId(
      userId,
      statuses,
      limit,
      offset
    );
    return listings;
  };

  const updateListing = async (
    userId: string,
    listingId: UUID,
    updatedDetails: UpdateListingReqBody
  ) => {
    const listingUpdatedEvent: ListingUpdatedEvent = {
      listingId,
      eventType: EventType.LISTING_UPDATED,
      data: updatedDetails,
      position: 0,
      version: 0,
      createdAt: new Date(),
      metadata: undefined,
    };
    await eventSourceRepository.insertEvent(listingUpdatedEvent);
  };

  const purchaseListing = async (listingId: UUID) => {
    const listingPurchased: ListingPurchasedEvent = {
      listingId,
      eventType: EventType.LISTING_PURCHASED,
      data: {},
      position: 0,
      version: 0,
      createdAt: new Date(),
      metadata: {},
    };
    await eventSourceRepository.insertEvent(listingPurchased);
  };

  const deleteListing = async (listingId: UUID) => {
    const listingDeleted: ListingDeletedEvent = {
      listingId,
      eventType: EventType.LISTING_DELETED,
      data: {},
      position: 0,
      version: 0,
      createdAt: new Date(),
      metadata: {},
    };
    await eventSourceRepository.insertEvent(listingDeleted);
  };

  return {
    createListing,
    getListings,
    getUserListings,
    updateListing,
    purchaseListing,
    deleteListing,
  };
};
