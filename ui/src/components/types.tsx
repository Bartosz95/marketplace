import { UUID } from "crypto";

export interface CreateListingRequestBody {
  title: string;
  description: string;
  price: number;
}

export interface ListingDetails {
  title: string;
  description: string;
  price: number;
  imagesUrls: string[];
}

export interface ListingProps extends ListingDetails {
  listingId: UUID;
  userId: string;
  status: string;
}

export enum FilterBy {
  Active = "ACTIVE",
  Sold = "SOLD",
  Archived = "ARCHIVED",
  All = "ALL",
}
