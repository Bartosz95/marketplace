import { ListingsStateRepository } from "../repositories/listingsStateRepository";
import { EventType, GetListingsResponse } from "../types";

export interface UserListingsDomain {
  getActive: (
    userId: string,
    limit?: number,
    offset?: number
  ) => Promise<GetListingsResponse>;
  getSold: (
    userId: string,
    limit?: number,
    offset?: number
  ) => Promise<GetListingsResponse>;
  getPurchased: (
    userId: string,
    limit?: number,
    offset?: number
  ) => Promise<GetListingsResponse>;
  getArchived: (
    userId: string,
    limit?: number,
    offset?: number
  ) => Promise<GetListingsResponse>;
  getAll: (
    userId: string,
    limit?: number,
    offset?: number
  ) => Promise<GetListingsResponse>;
}

export const UserListingsDomain = (
  listingsStateRepository: ListingsStateRepository
): UserListingsDomain => {
  const getActive = async (
    userId: string,
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
    userId: string,
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
    const listings = await listingsStateRepository.getListingsByPurchasedBy(
      userId,
      [EventType.LISTING_PURCHASED],
      limit,
      offset
    );
    return listings;
  };

  const getArchived = async (
    userId: string,
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
    userId: string,
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
