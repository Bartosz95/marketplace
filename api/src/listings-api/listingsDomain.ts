import { UUID } from "crypto";
import { Logger } from "winston";
import { ListingsStateRepository } from "../repositories/listingsStateRepository";
import {
  EventType,
  Listing,
  ListingCreatedEvent,
  ListingCreatedEventData,
  ListingDeletedEvent,
  ListingPurchasedEvent,
  ListingUpdatedEvent,
} from "../types";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import {
  CreateListingReqBody,
  UpdateListingReqBody,
} from "./listingsWriteRouter";

export interface Listings {
  createListing: (listing: CreateListingReqBody) => Promise<UUID>;
  getListing: (listing_id: UUID) => Promise<Listing | null>;
  getListings: (limit?: number, offset?: number) => Promise<Listing[]>;
  updateListing: (
    listing_id: UUID,
    data: UpdateListingReqBody
  ) => Promise<void>;
  purchaseListing: (listing_id: UUID) => Promise<void>;
  deleteListing: (listing_id: UUID) => Promise<void>;
}

export const Listings = (
  listingsStateRepository: ListingsStateRepository,
  eventSourceRepository: EventSourceRepository,
  logger: Logger
): Listings => {
  const createListing = async (data: CreateListingReqBody) => {
    const listingCreateEventData: ListingCreatedEvent = {
      listingId: crypto.randomUUID(), // will be replaced in db
      eventType: EventType.LISTING_CREATED,
      data: {
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

  const getListing = async (listingId: UUID): Promise<Listing | null> => {
    const listing = await listingsStateRepository.getListingById(listingId);
    return listing;
  };

  const getListings = async (limit = 10, offset = 0): Promise<Listing[]> => {
    const listings = await listingsStateRepository.getListings(limit, offset);
    return listings;
  };

  const updateListing = async (
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
    getListing,
    updateListing,
    purchaseListing,
    deleteListing,
  };
};
