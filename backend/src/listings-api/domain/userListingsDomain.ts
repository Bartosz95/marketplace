import { UUID } from "crypto";
import { ListingsStateRepository } from "../../repositories/listingsStateRepository";
import { PurchasesStateRepository } from "../../repositories/purchasesStateRepository";
import { EventType, GetListingsResponse } from "../../types";
import { ModifyImagesUrls } from "../../libs/modifyImagesUrls";
import { ImagesRepository } from "../../repositories/imagesRepository";

export interface UserListingsDomain {
  getActive: (
    userId: UUID,
    limit?: number,
    offset?: number
  ) => Promise<GetListingsResponse>;
  getSold: (
    userId: UUID,
    limit?: number,
    offset?: number
  ) => Promise<GetListingsResponse>;
  getPurchased: (
    userId: UUID,
    limit?: number,
    offset?: number
  ) => Promise<GetListingsResponse>;
  getArchived: (
    userId: UUID,
    limit?: number,
    offset?: number
  ) => Promise<GetListingsResponse>;
  getAll: (
    userId: UUID,
    limit?: number,
    offset?: number
  ) => Promise<GetListingsResponse>;
}

export const UserListingsDomain = (
  listingsStateRepository: ListingsStateRepository,
  purchasesStateRepository: PurchasesStateRepository,
  imagesRepository: ImagesRepository
): UserListingsDomain => {
  const modifyImagesUrls = ModifyImagesUrls(imagesRepository.imagesUrl);

  const getActive = async (
    userId: UUID,
    limit = 8,
    offset = 0
  ): Promise<GetListingsResponse> => {
    const listings = await listingsStateRepository.getListingsByUserId(
      userId,
      [EventType.LISTING_CREATED, EventType.LISTING_UPDATED],
      limit,
      offset
    );
    return modifyImagesUrls.addImageHostToListings(listings);
  };

  const getSold = async (
    userId: UUID,
    limit = 8,
    offset = 0
  ): Promise<GetListingsResponse> => {
    const listings = await listingsStateRepository.getListingsByUserId(
      userId,
      [EventType.LISTING_PURCHASED],
      limit,
      offset
    );
    return modifyImagesUrls.addImageHostToListings(listings);
  };

  const getPurchased = async (
    userId: string,
    limit = 8,
    offset = 0
  ): Promise<GetListingsResponse> => {
    const purchases = await purchasesStateRepository.getPurchasesByBuyerId(
      userId,
      [EventType.LISTING_PURCHASED],
      limit,
      offset
    );
    const listingsIds = purchases.purchases.map(
      (purchase) => purchase.listingId as UUID
    );
    const listings = await listingsStateRepository.getListingsByIds(
      listingsIds,
      limit,
      offset
    );
    return modifyImagesUrls.addImageHostToListings(listings);
  };

  const getArchived = async (
    userId: UUID,
    limit = 8,
    offset = 0
  ): Promise<GetListingsResponse> => {
    const listings = await listingsStateRepository.getListingsByUserId(
      userId,
      [EventType.LISTING_ARCHIVED],
      limit,
      offset
    );
    return modifyImagesUrls.addImageHostToListings(listings);
  };

  const getAll = async (
    userId: UUID,
    limit = 8,
    offset = 0
  ): Promise<GetListingsResponse> => {
    const listings = await listingsStateRepository.getListingsByUserId(
      userId,
      [
        EventType.LISTING_CREATED,
        EventType.LISTING_UPDATED,
        EventType.LISTING_PURCHASED,
        EventType.LISTING_ARCHIVED,
      ],
      limit,
      offset
    );
    return modifyImagesUrls.addImageHostToListings(listings);
  };

  return {
    getActive,
    getPurchased,
    getSold,
    getArchived,
    getAll,
  };
};
