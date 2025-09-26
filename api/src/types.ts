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

export interface ListingStateTableRow {
  listing_id: string;
  user_id: string;
  modified_at: string;
  status: string;
  version: number;
  title: string;
  description: string;
  price: number;
  images_urls: string[];
  purchased_by?: string;
}

export interface ListingState {
  listingId: UUID;
  userId: string;
  modifiedAt: Date;
  status: ListingStatus;
  version: number;
  title: string;
  description: string;
  price: number;
  imagesUrls: string[];
  purchasedBy?: string;
}

interface EventBaseInfo {
  streamId: UUID;
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
  userId: string;
  title: string;
  description: string;
  price: number;
  imagesUrls: string[];
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
  data: ListingPurchasedEventData;
}

export interface ListingPurchasedEventData {
  userId: string;
}

export interface ListingDeletedEvent extends EventBaseInfo {
  eventType: EventType.LISTING_DELETED;
  data: {};
}

export interface ListingArchivedEvent extends EventBaseInfo {
  eventType: EventType.LISTING_ARCHIVED;
  data: {};
}

export interface ImagesUploadedEvent extends EventBaseInfo {
  eventType: EventType.IMAGES_UPLOADED;
  data: ImagesUploadedEventData;
}

export interface ImagesUploadedEventData {
  imagesUrls: string[];
}

export type EventData =
  | {}
  | ListingCreatedEventData
  | ImagesUploadedEventData
  | ListingUpdatedEventData
  | ListingPurchasedEventData;

export type Event =
  | ListingCreatedEvent
  | ListingUpdatedEvent
  | ListingPurchasedEvent
  | ListingArchivedEvent
  | ListingDeletedEvent
  | ImagesUploadedEvent;

export interface GetListingsResponse {
  listings: ListingState[];
  countOfAll: number;
}
