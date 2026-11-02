import { UUID } from "crypto";

export enum EventType {
  LISTING_CREATED = "LISTING_CREATED",
  LISTING_UPDATED = "LISTING_UPDATED",
  LISTING_PURCHASED = "LISTING_PURCHASED",
  LISTING_ARCHIVED = "LISTING_ARCHIVED",
  LISTING_DELETED = "LISTING_DELETED",
  IMAGES_UPLOADED = "IMAGES_UPLOADED",
}

export enum ListingStatus {
  ACTIVE = "ACTIVE",
  RESERVED = "RESERVED",
  SOLD = "SOLD",
  ARCHIVED = "ARCHIVED",
  DELETED = "DELETED",
}

export interface ListingDetails {
  title: string;
  description: string;
  price: number;
  images: File[];
}

export interface Listing {
  listingId: UUID;
  userId: string;
  status: ListingStatus;
  title: string;
  description: string;
  price: number;
  imagesUrls: string[];
  paymentLink: string;
}

export enum FilterBy {
  All = "/",
  UserAll = "/user/all",
  UserActive = "/user/active",
  UserSold = "/user/sold",
  UserPurchased = "/user/purchased",
  UserArchived = "/user/archived",
}

export enum RequestAction {
  Create = "CREATE",
  Update = "UPDATE",
  Purchase = "PURCHASE",
  Archive = "ARCHIVE",
  Restore = "RESTORE",
  Delete = "DELETE",
}
