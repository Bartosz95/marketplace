import { UUID } from "crypto";

export enum EventType {
  LISTING_CREATED = "LISTING_CREATED",
  LISTING_UPDATED = "LISTING_UPDATED",
  IMAGES_UPLOADED = "IMAGES_UPLOADED",
  LISTING_PURCHASED = "LISTING_PURCHASED",
  LISTING_DELETED = "LISTING_DELETED",
  USER_FIRST_REQUEST = "USER_FIRST_REQUEST",
  USER_CREATED = "USER_CREATED",
  PURCHASE_REQUESTED = "PURCHASE_REQUESTED",
  PAYMENT_ACCOUNT_REQUESTED = "PAYMENT_ACCOUNT_REQUESTED",
  PAYMENT_ACCOUNT_CREATED = "PAYMENT_ACCOUNT_CREATED",
  CHECKOUT_SESSION_CREATED = "CHECKOUT_SESSION_CREATED",
  PAYMENT_SUCCEEDED = "PAYMENT_SUCCEEDED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
}

interface EventBaseInfo {
  streamId: UUID;
  position: number;
  version: number;
  createdAt: Date;
  metadata: unknown;
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
  status?: ListingStatus;
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
  data: object;
}

export interface ImagesUploadedEvent extends EventBaseInfo {
  eventType: EventType.IMAGES_UPLOADED;
  data: ImagesUploadedEventData;
}

export interface ImagesUploadedEventData {
  imagesUrls: string[];
}

export interface UserFirstRequest extends EventBaseInfo {
  eventType: EventType.USER_FIRST_REQUEST;
  data: UserFirstRequestEventData;
}

export interface UserFirstRequestEventData {
  authenticationProviderId: string;
  name?: string;
  email?: string;
  nickname?: string;
  emailVerified?: boolean;
}

export interface UserCreated extends EventBaseInfo {
  eventType: EventType.USER_CREATED;
  data: UserCreatedEventData;
}

export interface UserCreatedEventData {
  userId?: UUID;
  id?: UUID;
  authenticationProviderId: string;
  name: string;
  email: string;
  nickname?: string;
  emailVerified?: boolean;
}

export interface PaymentAccountRequestedEventData {
  userId: UUID;
  email: string;
}

export interface PaymentAccountCreatedEventData {
  userId: UUID;
  paymentProviderId: string;
}

export interface PurchaseRequestedEventData {
  listingId: UUID;
  sellerId: string;
  buyerId: string;
  buyerAuthenticationProviderId: string;
  price: number;
  currency: string;
}

export interface CheckoutSessionCreatedEventData extends PurchaseRequestedEventData {
  checkoutSessionId: string;
  checkoutUrl: string;
  sellerAccountId: string;
  applicationFeeAmount: number;
}

export interface PaymentSucceededEventData extends CheckoutSessionCreatedEventData {
  stripeEventId: string;
}

export interface PaymentFailedEventData extends CheckoutSessionCreatedEventData {
  stripeEventId: string;
  failureReason?: string;
}

export interface PaymentAccountRequestedEvent extends EventBaseInfo {
  eventType: EventType.PAYMENT_ACCOUNT_REQUESTED;
  data: PaymentAccountRequestedEventData;
}

export interface PaymentAccountCreatedEvent extends EventBaseInfo {
  eventType: EventType.PAYMENT_ACCOUNT_CREATED;
  data: PaymentAccountCreatedEventData;
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

export interface PaymentFailedEvent extends EventBaseInfo {
  eventType: EventType.PAYMENT_FAILED;
  data: PaymentFailedEventData;
}

export type EventData =
  | object
  | ListingCreatedEventData
  | ImagesUploadedEventData
  | ListingUpdatedEventData
  | ListingPurchasedEventData
  | PurchaseRequestedEventData
  | UserCreatedEventData
  | PaymentAccountRequestedEventData
  | PaymentAccountCreatedEventData
  | CheckoutSessionCreatedEventData
  | PaymentSucceededEventData
  | PaymentFailedEventData;

export type Event =
  | ListingCreatedEvent
  | ListingUpdatedEvent
  | ListingPurchasedEvent
  | ListingDeletedEvent
  | ImagesUploadedEvent
  | UserFirstRequest
  | UserCreated
  | PaymentAccountRequestedEvent
  | PaymentAccountCreatedEvent
  | PurchaseRequestedEvent
  | CheckoutSessionCreatedEvent
  | PaymentSucceededEvent
  | PaymentFailedEvent;

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
}

export interface GetListingsResponse {
  listings: ListingState[];
  countOfAll: number;
}

export interface PurchaseStateTableRow {
  purchase_id: string;
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
  purchaseId: UUID;
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
