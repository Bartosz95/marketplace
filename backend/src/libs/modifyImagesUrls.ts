import { GetListingsResponse, ListingState } from "../types";

export interface ModifyImagesUrls {
  removeImageHost: (imagesUrls: string[]) => string[];
  addImageHost: (imageUrl: string) => string;
  addImageHostToLinks: (links: string[]) => string[];
  addImageHostToListings: (
    listingsResponse: GetListingsResponse
  ) => GetListingsResponse;
}

export const ModifyImagesUrls = (imageHost: string) => {
  const removeImageHost = (imagesUrls: string[]) =>
    imagesUrls.map((imageUrl) => imageUrl.replace(imageHost.toString(), ``));

  const addImageHost = (imageUrl: string) => imageHost.concat(imageUrl);

  const addImageHostToLinks = (links: string[]): string[] =>
    links.map(addImageHost);

  const addImageHostToListings = (
    listingsResponse: GetListingsResponse
  ): GetListingsResponse => ({
    ...listingsResponse,
    listings: listingsResponse.listings.map((listing: ListingState) => ({
      ...listing,
      imagesUrls: listing.imagesUrls.map(addImageHost),
    })),
  });

  return {
    removeImageHost,
    addImageHost,
    addImageHostToLinks,
    addImageHostToListings,
  };
};
