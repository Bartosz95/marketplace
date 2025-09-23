"use client";
import { useEffect, useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { ListingProps } from "@/components/types";
import Listing from "@/components/Listing";
import { Container } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";

function MyListings() {
  const [listings, setListings] = useState<ListingProps[]>([]);
  const { getAccessTokenSilently } = useAuth0();
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  useEffect(() => {
    const fetchData = async () => {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
        },
      });
      const params = new URLSearchParams();
      if (user && user.sub ) params.append("ownerid", user.sub);
      console.log(`${process.env.NEXT_PUBLIC_API_URL}/listings?${params.toString()}`)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/listings?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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

  return (
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
}

export default MyListings;
