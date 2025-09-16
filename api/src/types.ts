import { UUID } from "crypto";

export enum EventType {
  LISTING_CREATED = "LISTING_CREATED",
  LISTING_UPDATED = "LISTING_UPDATED",
  LISTING_DELETED = "LISTING_DELETED",
  LISTING_PURCHASED = "LISTING_PURCHASED",
}

export interface Listing {
  listing_id?: UUID;
  status?: EventType;
  version?: number;
  title?: string;
  description?: string;
  price?: number;
  imageUrls?: string[];
}

export interface Event {
  position_id: number;
  listing_id: UUID;
  version: number;
  created_at: string;
  event_type: EventType;
  data: Listing;
  metadata: any;
}