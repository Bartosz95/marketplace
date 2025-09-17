import { UUID } from "crypto";

export enum EventType {
  LISTING_CREATED = "LISTING_CREATED",
  LISTING_UPDATED = "LISTING_UPDATED",
  LISTING_DELETED = "LISTING_DELETED",
  LISTING_PURCHASED = "LISTING_PURCHASED",
}

export interface Listing {
  listingId?: UUID;
  modifiedAt?: Date;
  status: EventType;
  title: string;
  description: string;
  price: number;
  imageUrls: string[];
}

export interface Event {
  position: number;
  listingId: UUID;
  version: number;
  createdAt: Date;
  eventType: EventType;
  data: Listing;
  metadata: any;
}
