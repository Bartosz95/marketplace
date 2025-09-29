import { UUID } from "crypto";
import { ListingsStateRepository } from "../../repositories/listingsStateRepository";
import { PurchasesStateRepository } from "../../repositories/purchasesStateRepository";
import { EventType, GetListingsResponse } from "../../types";

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
  purchasesStateRepository: PurchasesStateRepository
): UserListingsDomain => {
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
    return listings;
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
    return listings;
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
    return listings;
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
    return listings;
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
    return listings;
  };

  return {
    getActive,
    getPurchased,
    getSold,
    getArchived,
    getAll,
  };
};
