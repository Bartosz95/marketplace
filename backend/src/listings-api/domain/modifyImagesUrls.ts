import { GetListingsResponse, ListingState } from "../../types";

export const ModifyImagesUrls = (imageHost: string) => {
  const removeImageHost = (imagesUrls: string[]) =>
    imagesUrls.map((imageUrl) => imageUrl.replace(imageHost.toString(), ``));

  const addImageHost = (imageUrl: string) => imageHost.concat(imageUrl);

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
    addImageHostToListings,
  };
};
