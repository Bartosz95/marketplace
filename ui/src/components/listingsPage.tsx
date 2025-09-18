"use client";
import { useEffect, useState } from "react";
import MarketplaceNavBar from "@/components/MarketplaceNavBar";
import Listing, { ListingProps } from "@/components/Listing";

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
      setListings(result);
    };
    fetchData();
  }, []);

  const listingsView = listings.map((l) => (
    <Listing {...l} key={l.listingId} />
  ));

  return (
    <>
      <MarketplaceNavBar />
      {listingsView}
    </>
  );
}

export default ListingsPage;
