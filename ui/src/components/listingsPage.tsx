"use client";
import { useEffect, useState } from "react";
import MarketplaceNavBar from "@/components/MarketplaceNavBar";
// import Listing from "@/components/Listing";
import { ListingProps } from "./types";
import Listing from "@/components/Listing";

function ListingsPage() {
  const [listings, setListings] = useState<ListingProps[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const TOKEN = process.env.NEXT_PUBLIC_TOKEN;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/listings`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log(result)
      setListings(result);
    };
    fetchData();
  }, []);

  const listingsView = listings.map((listing) => (
    <Listing {...listing} key={listing.listingId} />
  ));

  return (
    <>
      <MarketplaceNavBar />
      {listingsView}
    </>
  );
}

export default ListingsPage;
