"use client";
import { useEffect, useState } from "react";
import MarketplaceNavBar from "@/components/MarketplaceNavBar";
import Listing, { ListingProps } from "@/components/Listing";

function ListingsPage() {
  const [listings, setListings] = useState<ListingProps[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const TOKEN = process.env.NEXT_PUBLIC__TOKEN;
      console.log(process.env);
      const response = await fetch(`http://localhost:3000/listings`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log(result);
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
