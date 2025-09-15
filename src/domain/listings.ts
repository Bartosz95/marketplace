import { UUID } from "crypto";
import { Logger } from "winston";
import { ListingsRepository } from "../listings/listingsRepository";
import { EventType, Listing, Event } from "../types";

export interface Listings {
  createListing: (listing: Listing) => Promise<void>;
  getAllListings: (
    limit?: number,
    returnDeleted?: boolean
  ) => Promise<Listing[]>;
  getListing: (listing_id: UUID) => Promise<Listing | null>;
  updateListing: (listing_id: UUID, listing: Listing) => Promise<void>;
  purchaseListing: (listing_id: UUID) => Promise<void>;
  deleteListing: (listing_id: UUID) => Promise<void>;
}

export const Listings = (
  repository: ListingsRepository,
  logger: Logger
): Listings => {
  const createListing = async (listing: Listing) => {
    await repository.insertEvent(EventType.LISTING_CREATED, listing);
  };

  const getAllListings = async (
    limit = 10,
    returnDeleted = false
  ): Promise<Listing[]> => {
    const listingsEvents = await repository.getEvents(limit, returnDeleted);
    return buildListingsFromEvents(listingsEvents);
  };

  const getListing = async (listingID: UUID) => {
    const listingEvents = await repository.getEventsByID(listingID);
    return buildListingFromEvents(listingEvents);
  };

  const updateListing = async (listingID: UUID, data: Listing) => {
    await repository.insertEventByID(
      listingID,
      EventType.LISTING_UPDATED,
      data
    );
  };

  const purchaseListing = async (listingID: UUID) => {
    await repository.insertEventByID(listingID, EventType.LISTING_PURCHASED);
  };

  const deleteListing = async (listingID: UUID) => {
    await repository.insertEventByID(listingID, EventType.LISTING_DELETED);
  };

  const buildListingsFromEvents = (events: Event[]): Listing[] => {
    const eventsByListingId: any = Object.groupBy(
      events,
      ({ listing_id }) => listing_id || ``
    );
    const listings: Listing[] = [];
    for (const listingID in eventsByListingId) {
      const listingEvents: Event[] = eventsByListingId[listingID];
      listings.push(buildListingFromEvents(listingEvents));
    }
    return listings;
  };

  const buildListingFromEvents = (events: Event[]): Listing => {
    const createdEvent = events.find(
      (event) => event.event_type === EventType.LISTING_CREATED
    );
    if (!createdEvent) throw new Error("Listing not found");
    let listing: Listing = {
      ...createdEvent?.data,
      listing_id: createdEvent?.listing_id,
      version: createdEvent?.version,
      status: EventType.LISTING_CREATED,
    };
    for (const event of events.sort((a, b) => a.version - b.version)) {
      switch (event.event_type) {
        case EventType.LISTING_UPDATED:
          listing = { ...listing, ...event.data, status: event.event_type };
          break;
        case EventType.LISTING_PURCHASED:
        case EventType.LISTING_DELETED:
          listing.status = event.event_type;
          break;
      }
    }
    return listing;
  };

  return {
    createListing,
    getAllListings,
    getListing,
    updateListing,
    purchaseListing,
    deleteListing,
  };
};
