import { UUID } from "crypto";
import { Logger } from "winston";
import { ListingsStateRepository } from "../repositories/listingsStateRepository";
import {
  EventType,
  FilterBy,
  ImagesUploadedEventData,
  ListingArchivedEvent,
  ListingCreatedEventData,
  ListingState,
} from "../types";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import {
  CreateListingReqBody,
  UpdateListingReqBody,
} from "./listingsWriteRouter";

export interface ListingsDomain {
  createListing: (userId: string, data: CreateListingReqBody) => Promise<UUID>;
  updateImages: (
    streamId: UUID,
    data: ImagesUploadedEventData
  ) => Promise<void>;
  updateListing: (
    userId: string,
    listing_id: UUID,
    data: UpdateListingReqBody
  ) => Promise<void>;
  getListings: (limit?: number, offset?: number) => Promise<ListingState[]>;
  getUserListings: (
    userId: string,
    filter: FilterBy,
    limit?: number,
    offset?: number
  ) => Promise<ListingState[]>;

  purchaseListing: (userId: string, listing_id: UUID) => Promise<void>;
  archiveListing: (userId: string, listing_id: UUID) => Promise<void>;
  deleteListing: (userId: string, listing_id: UUID) => Promise<void>;
}

export const ListingsDomain = (
  listingsStateRepository: ListingsStateRepository,
  eventSourceRepository: EventSourceRepository,
  logger: Logger
): ListingsDomain => {
  const createListing = async (userId: string, data: CreateListingReqBody) => {
    const { title, description, price } = data;
    const eventData: ListingCreatedEventData = {
      userId,
      title,
      description,
      price,
      imagesUrls: [],
    };

    const listingId = await eventSourceRepository.insertEvent(
      EventType.LISTING_CREATED,
      eventData
    );
    return listingId;
  };

  const updateImages = async (
    listingId: UUID,
    data: ImagesUploadedEventData
  ) => {
    await eventSourceRepository.insertEventByStreamId(
      listingId,
      EventType.IMAGES_UPLOADED,
      data
    );
  };

  const updateListing = async (
    userId: string,
    listingId: UUID,
    data: UpdateListingReqBody
  ) => {
    const currentState = await listingsStateRepository.getListingById(
      listingId
    );
    if (!currentState) throw new Error(`currentState undefined`);
    if (userId !== currentState.userId)
      throw new Error(`User ${userId} try modify not his listing ${listingId}`);
    if (
      currentState.status === EventType.LISTING_DELETED ||
      currentState.status === EventType.LISTING_PURCHASED
    )
      throw new Error(
        `Cannot update listing ${listingId} because is ${currentState.status}`
      );

    switch (data.status) {
      case EventType.LISTING_ARCHIVED:
        await eventSourceRepository.insertEventByStreamId(
          listingId,
          EventType.LISTING_ARCHIVED,
          {}
        );
        break;
      case EventType.LISTING_UPDATED:
        await eventSourceRepository.insertEventByStreamId(
          listingId,
          EventType.LISTING_UPDATED,
          {}
        );
        break;
      default:
        await eventSourceRepository.insertEventByStreamId(
          listingId,
          EventType.LISTING_UPDATED,
          data
        );
    }
  };

  const purchaseListing = async (userId: string, listingId: UUID) => {
    const listing = await listingsStateRepository.getListingById(listingId);
    if (!listing) throw new Error(`listing undefined`);
    if (userId === listing.userId)
      throw Error(`User ${userId} try to purchase its own item`);
    await eventSourceRepository.insertEventByStreamId(
      listingId,
      EventType.LISTING_PURCHASED,
      {
        userId,
      }
    );
  };

  const deleteListing = async (userId: string, listingId: UUID) => {
    const listing = await listingsStateRepository.getListingById(listingId);
    if (!listing) throw new Error(`listing undefined`);
    if (userId !== listing.userId)
      throw Error(`User ${userId} try to modify listing ${listingId}`);
    await eventSourceRepository.insertEventByStreamId(
      listingId,
      EventType.LISTING_DELETED,
      {}
    );
  };

  const archiveListing = async (userId: string, listingId: UUID) => {
    const listing = await listingsStateRepository.getListingById(listingId);
    if (!listing) throw new Error(`listing undefined`);
    if (userId !== listing.userId)
      throw Error(`User ${userId} try to modify listing ${listingId}`);
    await eventSourceRepository.insertEventByStreamId(
      listingId,
      EventType.LISTING_ARCHIVED,
      {}
    );
  };

  const getListings = async (
    limit = 8,
    offset = 0
  ): Promise<ListingState[]> => {
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
    limit = 8,
    offset = 0
  ): Promise<ListingState[]> => {
    let statuses: EventType[] = [];

    switch (filter) {
      case FilterBy.Purchased:
        const listings = await listingsStateRepository.getListingsByPurchasedBy(
          userId,
          [EventType.LISTING_PURCHASED],
          limit,
          offset
        );
        return listings;
      case FilterBy.Active:
        statuses.push(EventType.LISTING_CREATED);
        statuses.push(EventType.LISTING_UPDATED);
        break;
      case FilterBy.Sold:
        statuses.push(EventType.LISTING_PURCHASED);
        break;
      case FilterBy.Archived:
        statuses.push(EventType.LISTING_ARCHIVED);
        break;
      case FilterBy.All:
        statuses.push(EventType.LISTING_CREATED);
        statuses.push(EventType.LISTING_UPDATED);
        statuses.push(EventType.LISTING_PURCHASED);
        statuses.push(EventType.LISTING_ARCHIVED);
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

  return {
    createListing,
    updateImages,
    getListings,
    getUserListings,
    updateListing,
    purchaseListing,
    archiveListing,
    deleteListing,
  };
};
