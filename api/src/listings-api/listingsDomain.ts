import { UUID } from "crypto";
import { ListingsStateRepository } from "../repositories/listingsStateRepository";
import {
  EventType,
  GetListingsResponse,
  ImagesUploadedEventData,
  ListingCreatedEventData,
  ListingState,
} from "../types";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import {
  CreateListingReqBody,
  UpdateListingReqBody,
} from "./listingsWriteRouter";

export interface ListingsDomain {
  create: (userId: string, data: CreateListingReqBody) => Promise<UUID>;
  updateImages: (
    streamId: UUID,
    data: ImagesUploadedEventData
  ) => Promise<void>;
  update: (
    userId: string,
    listing_id: UUID,
    data: UpdateListingReqBody
  ) => Promise<void>;
  purchase: (userId: string, listing_id: UUID) => Promise<void>;
  archive: (userId: string, listing_id: UUID) => Promise<void>;
  restore: (userId: string, listing_id: UUID) => Promise<void>;
  deleteListing: (userId: string, listing_id: UUID) => Promise<void>;
  getListings: (limit?: number, offset?: number) => Promise<GetListingsResponse>;
}

export const ListingsDomain = (
  listingsStateRepository: ListingsStateRepository,
  eventSourceRepository: EventSourceRepository
): ListingsDomain => {
  const create = async (userId: string, data: CreateListingReqBody) => {
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

  const update = async (
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

    await eventSourceRepository.insertEventByStreamId(
      listingId,
      EventType.LISTING_UPDATED,
      data
    );
  };

    const purchase = async (userId: string, listingId: UUID) => {
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

  const archive = async (userId: string, listingId: UUID) => {
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

    await eventSourceRepository.insertEventByStreamId(
      listingId,
      EventType.LISTING_ARCHIVED,
      {}
    );
  };

  const restore = async (userId: string, listingId: UUID) => {
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

    await eventSourceRepository.insertEventByStreamId(
      listingId,
      EventType.LISTING_UPDATED,
      {}
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

  const getListings = async (
    limit = 8,
    offset = 0
  ): Promise<GetListingsResponse> => {
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

  return {
    create,
    updateImages,
    update,
    purchase,
    archive,
    restore,
    deleteListing,
    getListings,
  };
};
