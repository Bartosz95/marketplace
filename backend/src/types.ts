import { UUID } from "crypto";

export enum EventType {
  LISTING_CREATED = "LISTING_CREATED",
  LISTING_UPDATED = "LISTING_UPDATED",
  LISTING_PURCHASED = "LISTING_PURCHASED",
  LISTING_ARCHIVED = "LISTING_ARCHIVED",
  LISTING_DELETED = "LISTING_DELETED",
  IMAGES_UPLOADED = "IMAGES_UPLOADED",
  PAYMENT_LINK_CREATED = "PAYMENT_LINK_CREATED",
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
  sellerId: string;
  buyerId: string;
  price: number;
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

export interface PaymentLinkCreatedEvent extends EventBaseInfo {
  eventType: EventType.PAYMENT_LINK_CREATED;
  data: PaymentLinkCreatedEventData;
}

export interface PaymentLinkCreatedEventData {
  paymentLink: string;
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
  | ImagesUploadedEvent
  | PaymentLinkCreatedEvent;

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
  payment_link: string;
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
  paymentLink: string;
}

export interface GetListingsResponse {
  listings: ListingState[];
  countOfAll: number;
}

export interface PurchaseStateTableRow {
  listing_id: string;
  seller_id: string;
  buyer_id: string;
  price: number;
  modified_at: string;
  status: string;
  version: number;
}

export type PurchaseStatus = EventType.LISTING_PURCHASED;

export interface PurchaseState {
  listingId: UUID;
  sellerId: string;
  buyerId: string;
  price: number;
  modifiedAt: Date;
  status: PurchaseStatus;
  version: number;
}

export interface GetPurchasesResponse {
  purchases: PurchaseState[];
  countOfAll: number;
}
