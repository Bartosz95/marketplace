import { UUID } from "crypto";
import { Logger } from "winston";
import { ListingsStateRepository } from "../repositories/listingsStateRepository";
import { EventType, Listing } from "../types";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { CreateListingReqBody, UpdateListingReqBody } from "./listingsRouter";

export interface Listings {
  createListing: (listing: CreateListingReqBody) => Promise<void>;
  getListing: (listing_id: UUID) => Promise<Listing>;
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
    await eventSourceRepository.insertEvent(EventType.LISTING_CREATED, data);
  };

  const getListing = async (listingId: UUID): Promise<Listing> => {
    const listing = await listingsStateRepository.getListingById(listingId);
    return listing;
  };

  const getListings = async (limit = 10, offset = 0): Promise<Listing[]> => {
    const listings = await listingsStateRepository.getListings(limit, offset);
    return listings;
  };

  const updateListing = async (
    listingId: UUID,
    listingDetails: UpdateListingReqBody
  ) => {
    const listing = await listingsStateRepository.getListingById(listingId);
    const data = { ...listing, ...listingDetails };
    await eventSourceRepository.insertEventByID(
      listingId,
      EventType.LISTING_UPDATED,
      data
    );
  };

  const purchaseListing = async (listingId: UUID) => {
    const listing = await listingsStateRepository.getListingById(listingId);
    if (listing.status === EventType.LISTING_DELETED) {
      throw new Error(`Attempt to purchase deleted listing: ${listingId}`);
    }
    if (listing.status === EventType.LISTING_PURCHASED) {
      throw new Error(`Attempt to purchase purchased listing: ${listingId}`);
    }
    await eventSourceRepository.insertEventByID(
      listingId,
      EventType.LISTING_PURCHASED
    );
  };

  const deleteListing = async (listingId: UUID) => {
    await eventSourceRepository.insertEventByID(
      listingId,
      EventType.LISTING_DELETED
    );
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
