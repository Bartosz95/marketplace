import { UUID } from "crypto";
import { ListingsStateRepository } from "../../repositories/listingsStateRepository";
import {
  EventType,
  GetListingsResponse,
  ListingCreatedEventData,
  ListingPurchasedEventData,
  ListingState,
} from "../../types";
import { EventSourceRepository } from "../../repositories/eventSourceRepository";
import { CreateListing, UpdateListing } from "../listingsWriteRouter";
import { ImagesRepository } from "../../repositories/imagesRepository";
import { ModifyImagesUrls } from "./modifyImagesUrls";

export interface ListingsDomain {
  create: (userId: string, data: CreateListing) => Promise<void>;
  update: (
    userId: string,
    listing_id: UUID,
    data: UpdateListing
  ) => Promise<void>;
  purchase: (userId: string, listing_id: UUID) => Promise<void>;
  archive: (userId: string, listing_id: UUID) => Promise<void>;
  restore: (userId: string, listing_id: UUID) => Promise<void>;
  deleteListing: (userId: string, listing_id: UUID) => Promise<void>;
  getListings: (
    limit?: number,
    offset?: number
  ) => Promise<GetListingsResponse>;
  getListingById: (listingId: UUID) => Promise<ListingState | undefined>;
}

export const ListingsDomain = (
  listingsStateRepository: ListingsStateRepository,
  eventSourceRepository: EventSourceRepository,
  imagesRepository: ImagesRepository
): ListingsDomain => {
  const modifyImagesUrls = ModifyImagesUrls(imagesRepository.imagesUrl);

  const create = async (userId: string, data: CreateListing) => {
    const { title, description, price, images } = data;
    const eventData: ListingCreatedEventData = {
      userId,
      title,
      description,
      price,
    };

    const listingId = await eventSourceRepository.insertEvent(
      EventType.LISTING_CREATED,
      eventData
    );
    const imagesUrls = await imagesRepository.uploadImages(listingId, images);
    await eventSourceRepository.insertEventByStreamId(
      listingId,
      EventType.IMAGES_UPLOADED,
      { imagesUrls: modifyImagesUrls.removeImageHost(imagesUrls) }
    );
  };

  const update = async (
    userId: string,
    listingId: UUID,
    data: UpdateListing
  ) => {
    const { title, price, description, images } = data;
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
      { title, price, description }
    );
    if (images) {
      await imagesRepository.deleteImages(listingId);
      const imagesUrls = await imagesRepository.uploadImages(listingId, images);
      await eventSourceRepository.insertEventByStreamId(
        listingId,
        EventType.IMAGES_UPLOADED,
        { imagesUrls: modifyImagesUrls.removeImageHost(imagesUrls) }
      );
    }
  };

  const purchase = async (userId: string, listingId: UUID) => {
    const listing = await listingsStateRepository.getListingById(listingId);
    if (!listing) throw new Error(`listing undefined`);
    if (userId === listing.userId)
      throw Error(`User ${userId} try to purchase its own item`);

    const purchaseEventData: ListingPurchasedEventData = {
      sellerId: listing.userId,
      buyerId: userId,
      price: listing.price,
    };

    await eventSourceRepository.insertEventByStreamId(
      listingId,
      EventType.LISTING_PURCHASED,
      purchaseEventData
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
    await imagesRepository.deleteImages(listingId);
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

    return modifyImagesUrls.addImageHostToListings(listings);
  };

  const getListingById = async (
    listingId: UUID
  ): Promise<ListingState | undefined> => {
    const statuses: EventType[] = [
      EventType.LISTING_CREATED,
      EventType.LISTING_UPDATED,
    ];
    const listings = await listingsStateRepository.getListingById(listingId);

    return listings;
  };

  return {
    create,
    update,
    purchase,
    archive,
    restore,
    deleteListing,
    getListings,
    getListingById,
  };
};
