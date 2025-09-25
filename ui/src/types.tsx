import { UUID } from "crypto";

export enum EventType {
  LISTING_CREATED = "LISTING_CREATED",
  LISTING_UPDATED = "LISTING_UPDATED",
  LISTING_PURCHASED = "LISTING_PURCHASED",
  LISTING_ARCHIVED = "LISTING_ARCHIVED",
  LISTING_DELETED = "LISTING_DELETED",
  IMAGES_UPLOADED = "IMAGES_UPLOADED",
}

export type ListingStatus =
  | EventType.LISTING_CREATED
  | EventType.LISTING_UPDATED
  | EventType.LISTING_PURCHASED
  | EventType.LISTING_ARCHIVED
  | EventType.LISTING_DELETED;

export interface ListingProps {
  listingId?: UUID;
  userId?: string;
  status?: ListingStatus;
  title: string;
  description: string;
  price: number;
  imagesUrls: string[];
}

export enum FilterBy {
  All = "/",
  Active = "/user/active",
  Sold = "/user/sold",
  Purchased = "/user/purchased",
  Archived = "/user/archived",
  UserAll = "/user",
}

export enum RequestAction {
  Create = "CREATE",
  Update = "UPDATE",
  Purchase = "PURCHASE",
  Archive = "ARCHIVE",
  Restore = "RESTORE",
  Delete = "DELETE",
}
