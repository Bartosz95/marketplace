import { ListingsStateRepository } from "../repositories/listingsStateRepository";
import { EventType, ListingState } from "../types";

export interface UserListingsDomain {
  getActive: (
    userId: string,
    limit?: number,
    offset?: number
  ) => Promise<ListingState[]>;
  getSold: (
    userId: string,
    limit?: number,
    offset?: number
  ) => Promise<ListingState[]>;
  getPurchased: (
    userId: string,
    limit?: number,
    offset?: number
  ) => Promise<ListingState[]>;
  getArchived: (
    userId: string,
    limit?: number,
    offset?: number
  ) => Promise<ListingState[]>;
  getAll: (
    userId: string,
    limit?: number,
    offset?: number
  ) => Promise<ListingState[]>;
}

export const UserListingsDomain = (
  listingsStateRepository: ListingsStateRepository,
): UserListingsDomain => {
  const getActive = async (
    userId: string,
    limit = 8,
    offset = 0
  ): Promise<ListingState[]> => {
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
  ): Promise<ListingState[]> => {
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
  ): Promise<ListingState[]> => {
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
  ): Promise<ListingState[]> => {
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
  ): Promise<ListingState[]> => {
    const listings = await listingsStateRepository.getListingsByUserId(
      userId,
      [
        EventType.LISTING_CREATED,
        EventType.LISTING_UPDATED,
        EventType.LISTING_PURCHASED,
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
