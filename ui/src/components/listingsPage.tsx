"use client";
import { useEffect, useState } from "react";
import Listing, { ListingProps } from "./listing";

export const ListingsPage = () => {
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

  return (
    <>
      {listings.map((l) => (
        <Listing {...l} key={l.listingId} />
      ))}
    </>
  );
};
