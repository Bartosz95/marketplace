import { UUID } from "crypto";

export interface ListingDetails {
  title: string;
  description: string;
  price: number;
  imagesUrls: string[];
}

export interface ListingProps extends ListingDetails {
  listingId: UUID;
  status: string;
}
