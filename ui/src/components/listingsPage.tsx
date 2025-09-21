"use client";
import { useEffect, useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { ListingProps } from "./types";
import MarketplaceNavBar from "@/components/MarketplaceNavBar";
import Listing from "@/components/Listing";
import { Container } from "react-bootstrap";

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
      console.log(result);
      setListings(result);
    };
    fetchData();
  }, []);

  const listingsView = (
    <Container>
      <Row key={1}>
        {listings.map((listing, idx) => (
          <Col key={idx} style={{ flex: "0 0 0" }}>
            <Listing {...listing} key={listing.listingId} />
          </Col>
        ))}
      </Row>
    </Container>
  );

  return (
    <>
      <MarketplaceNavBar />
      {listingsView}
    </>
  );
}

export default ListingsPage;
