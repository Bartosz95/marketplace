import { UUID } from "crypto";

export enum EventType {
  LISTING_CREATED = "LISTING_CREATED",
  LISTING_UPDATED = "LISTING_UPDATED",
  LISTING_DELETED = "LISTING_DELETED",
  LISTING_PURCHASED = "LISTING_PURCHASED",
  IMAGES_UPLOADED = "IMAGES_UPLOADED",
}

export type ListingStatus =
  | EventType.LISTING_CREATED
  | EventType.LISTING_UPDATED
  | EventType.LISTING_PURCHASED
  | EventType.LISTING_DELETED;

export interface Listing {
  listingId: UUID;
  status: ListingStatus;
  modifiedAt: Date;
  title: string;
  description: string;
  price: number;
  imagesUrls: string[];
}

interface EventBaseInfo {
  listingId: UUID;
  position: number;
  version: number;
  createdAt: Date;
  metadata: any;
}

export interface ListingCreatedEvent extends EventBaseInfo {
  eventType: EventType.LISTING_CREATED;
  data: ListingCreatedEventData;
}

export interface ListingCreatedEventData {
  title: string;
  description: string;
  price: number;
}

export interface ListingUpdatedEvent extends EventBaseInfo {
  eventType: EventType.LISTING_UPDATED;
  data: ListingUpdatedEventData;
}

export interface ListingUpdatedEventData {
  title?: string;
  description?: string;
  price?: number;
}

export interface ListingPurchasedEvent extends EventBaseInfo {
  eventType: EventType.LISTING_PURCHASED;
  data: {};
}

export interface ListingDeletedEvent extends EventBaseInfo {
  eventType: EventType.LISTING_DELETED;
  data: {};
}

export interface ImagesUploadedEvent extends EventBaseInfo {
  eventType: EventType.IMAGES_UPLOADED;
  data: ImagesUploadedEventData;
}

export interface ImagesUploadedEventData {
  imagesUrls: string[];
}

export type Event =
  | ListingCreatedEvent
  | ListingUpdatedEvent
  | ListingPurchasedEvent
  | ListingDeletedEvent
  | ImagesUploadedEvent;
