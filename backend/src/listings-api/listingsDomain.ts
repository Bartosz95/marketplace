import { UUID } from "crypto";
import { ListingsStateRepository } from "../repositories/listingsStateRepository";
import {
  EventType,
  GetListingsResponse,
  ListingCreatedEventData,
  PurchaseRequestedEventData,
  ListingState,
  ListingStatus,
} from "../types";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { CreateListing, UpdateListing } from "./listingsWriteRouter";
import { ImagesRepository } from "../repositories/imagesRepository";
import { ModifyImagesUrls } from "../libs/modifyImagesUrls";

export interface ListingsDomain {
  create: (userId: UUID, data: CreateListing) => Promise<void>;
  update: (
    userId: UUID,
    listing_id: UUID,
    data: UpdateListing,
  ) => Promise<void>;
  deleteListing: (userId: UUID, listing_id: UUID) => Promise<void>;
  getListing: (listingId: UUID) => Promise<ListingState | undefined>;
  getListings: (
    limit?: number,
    offset?: number,
  ) => Promise<GetListingsResponse>;
  getListingsByUserId: (
    userId: UUID,
    limit?: number,
    offset?: number,
  ) => Promise<GetListingsResponse>;
}

export const ListingsDomain = (
  listingsStateRepository: ListingsStateRepository,
  eventSourceRepository: EventSourceRepository,
  imagesRepository: ImagesRepository,
): ListingsDomain => {
  const modifyImagesUrls = ModifyImagesUrls(imagesRepository.imagesUrl);

  const create = async (userId: UUID, data: CreateListing) => {
    const { title, description, price, images } = data;
    const eventData: ListingCreatedEventData = {
      userId,
      title,
      description,
      price,
    };

    const listingId = await eventSourceRepository.insertEvent(
      EventType.LISTING_CREATED,
      eventData,
    );
    const imagesUrls = await imagesRepository.uploadImages(listingId, images);
    await eventSourceRepository.insertEventByStreamId(
      listingId,
      EventType.IMAGES_UPLOADED,
      { imagesUrls: modifyImagesUrls.removeImageHost(imagesUrls) },
    );
  };

  const update = async (userId: UUID, listingId: UUID, data: UpdateListing) => {
    const { title, price, description, images, status } = data;
    const currentState = await listingsStateRepository.getListing(listingId);
    if (!currentState) throw new Error(`currentState undefined`);
    if (userId !== currentState.userId)
      throw new Error(`User ${userId} try modify not his listing ${listingId}`);
    if (
      currentState.status !== ListingStatus.ACTIVE &&
      currentState.status !== ListingStatus.ARCHIVED
    )
      throw new Error(
        `Cannot update listing ${listingId} because is ${currentState.status}`,
      );

    await eventSourceRepository.insertEventByStreamId(
      listingId,
      EventType.LISTING_UPDATED,
      { title, price, description, status },
    );
    if (images) {
      await imagesRepository.deleteImages(listingId);
      const imagesUrls = await imagesRepository.uploadImages(listingId, images);
      await eventSourceRepository.insertEventByStreamId(
        listingId,
        EventType.IMAGES_UPLOADED,
        { imagesUrls: modifyImagesUrls.removeImageHost(imagesUrls) },
      );
    }
  };

  const purchaseRequested = async (userId: UUID, listingId: UUID) => {
    const listing = await listingsStateRepository.getListing(listingId);
    if (!listing) throw new Error(`listing undefined`);
    if (userId === listing.userId)
      throw Error(`User ${userId} requested to purchase its own item`);

    if (listing.status !== ListingStatus.ACTIVE)
      throw new Error(
        `Listing ${listingId} is not available for purchase. Current status: ${listing.status}`,
      );

    const purchaseEventData: PurchaseRequestedEventData = {
      sellerId: listing.userId,
      buyerId: userId,
      price: listing.price,
      listingId,
      currency: "aud",
    };

    await eventSourceRepository.insertEventByStreamId(
      listingId,
      EventType.PURCHASE_REQUESTED,
      purchaseEventData,
    );
  };

  const deleteListing = async (userId: UUID, listingId: UUID) => {
    const listing = await listingsStateRepository.getListing(listingId);
    if (!listing) throw new Error(`listing undefined`);
    if (userId !== listing.userId)
      throw Error(`User ${userId} try to modify listing ${listingId}`);
    if (listing.status === ListingStatus.DELETED) {
      throw new Error(`Listing ${listingId} has already been deleted`);
    }
    await eventSourceRepository.insertEventByStreamId(
      listingId,
      EventType.LISTING_DELETED,
      {},
    );
    await imagesRepository.deleteImages(listingId);
  };

  const getListing = async (
    listingId: UUID,
  ): Promise<ListingState | undefined> => {
    const listings = await listingsStateRepository.getListing(listingId);
    return listings;
  };

  const getListings = async (
    limit = 8,
    offset = 0,
  ): Promise<GetListingsResponse> => {
    const statuses: ListingStatus[] = [ListingStatus.ACTIVE];
    const listings = await listingsStateRepository.getListings(
      statuses,
      limit,
      offset,
    );

    return modifyImagesUrls.addImageHostToListings(listings);
  };

  const getListingsByUserId = async (
    userId: UUID,
    limit = 8,
    offset = 0,
  ): Promise<GetListingsResponse> => {
    const statuses: ListingStatus[] = [
      ListingStatus.ACTIVE,
      ListingStatus.ARCHIVED,
    ];
    const listings = await listingsStateRepository.getListingsByUserId(
      userId,
      statuses,
      limit,
      offset,
    );
    return modifyImagesUrls.addImageHostToListings(listings);
  };

  return {
    create,
    update,
    deleteListing,
    getListing,
    getListings,
    getListingsByUserId,
  };
};
