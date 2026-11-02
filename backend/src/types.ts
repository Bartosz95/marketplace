import { UUID } from "crypto";

export enum EventType {
  LISTING_CREATED = "LISTING_CREATED",
  LISTING_UPDATED = "LISTING_UPDATED",
  LISTING_PURCHASED = "LISTING_PURCHASED",
  LISTING_ARCHIVED = "LISTING_ARCHIVED",
  LISTING_RESTORED = "LISTING_RESTORED",
  LISTING_DELETED = "LISTING_DELETED",
  IMAGES_UPLOADED = "IMAGES_UPLOADED",
  PAYMENT_LINK_CREATED = "PAYMENT_LINK_CREATED",
  USER_FIRST_REQUEST = "USER_FIRST_REQUEST",
  USER_CREATED = "USER_CREATED",
  PURCHASE_REQUESTED = "PURCHASE_REQUESTED",
  CHECKOUT_SESSION_CREATED = "CHECKOUT_SESSION_CREATED",
  PAYMENT_SUCCEEDED = "PAYMENT_SUCCEEDED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
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

export interface ListingRestoredEvent extends EventBaseInfo {
  eventType: EventType.LISTING_RESTORED;
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

export interface UserFirstRequest extends EventBaseInfo {
  eventType: EventType.USER_FIRST_REQUEST;
  data: UserFirstRequestEventData;
}

export interface UserFirstRequestEventData {
  authenticationProviderId: string;
}

export interface UserCreated extends EventBaseInfo {
  eventType: EventType.USER_CREATED;
  data: UserCreatedEventData;
}

export interface UserCreatedEventData {
  name: string[];
}

export interface PurchaseRequestedEventData {
  listingId: UUID;
  sellerId: string;
  buyerId: string;
  price: number;
  currency: string;
}

export interface CheckoutSessionCreatedEventData extends PurchaseRequestedEventData {
  checkoutSessionId: string;
  checkoutUrl: string;
}

export interface PaymentSucceededEventData extends CheckoutSessionCreatedEventData {
  stripeEventId: string;
}

export interface PurchaseRequestedEvent extends EventBaseInfo {
  eventType: EventType.PURCHASE_REQUESTED;
  data: PurchaseRequestedEventData;
}

export interface CheckoutSessionCreatedEvent extends EventBaseInfo {
  eventType: EventType.CHECKOUT_SESSION_CREATED;
  data: CheckoutSessionCreatedEventData;
}

export interface PaymentSucceededEvent extends EventBaseInfo {
  eventType: EventType.PAYMENT_SUCCEEDED;
  data: PaymentSucceededEventData;
}

export type EventData =
  | {}
  | ListingCreatedEventData
  | ImagesUploadedEventData
  | ListingUpdatedEventData
  | ListingPurchasedEventData
  | PurchaseRequestedEventData
  | CheckoutSessionCreatedEventData
  | PaymentSucceededEventData;

export type Event =
  | ListingCreatedEvent
  | ListingUpdatedEvent
  | ListingPurchasedEvent
  | ListingArchivedEvent
  | ListingRestoredEvent
  | ListingDeletedEvent
  | ImagesUploadedEvent
  | PaymentLinkCreatedEvent
  | UserFirstRequest
  | UserCreated
  | PurchaseRequestedEvent
  | CheckoutSessionCreatedEvent
  | PaymentSucceededEvent;

export enum ListingStatus {
  ACTIVE = "ACTIVE",
  RESERVED = "RESERVED",
  SOLD = "SOLD",
  ARCHIVED = "ARCHIVED",
  DELETED = "DELETED",
}

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

export enum PurchaseStatus {
  REQUESTED = "REQUESTED",
  CHECKOUT_CREATED = "CHECKOUT_CREATED",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

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
