import { UUID } from "crypto";

export interface ListingProps {
  listingId?: UUID;
  userId?: string;
  status?: string;
  title: string;
  description: string;
  price: number;
  imagesUrls: string[];
}

export enum FilterBy {
  Active = "ACTIVE",
  Sold = "SOLD",
  Archived = "ARCHIVED",
  All = "ALL",
}
