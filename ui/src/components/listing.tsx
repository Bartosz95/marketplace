import { UUID } from "crypto";

export interface ListingProps {
  description: string;
  imageUrls: string[];
  listing_id: UUID;
  price: number;
  status: string;
  title: string;
  version: number;
}

export const Listing = ({
  description,
  imageUrls,
  listing_id,
  price,
  status,
  title,
  version,
}: ListingProps) => {
  return (
    <>
      <h1>{title}</h1>
      <h1>{description}</h1>
      <div>Price: {price} AUD</div>
    </>
  );
};
