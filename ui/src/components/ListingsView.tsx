"use client";
import { useEffect, useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { ListingProps } from "./types";
import Listing from "@/components/Listing";
import { Container } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";

function ListingsView() {
  const [listings, setListings] = useState<ListingProps[]>([]);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchData = async () => {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
        },
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/listings`,
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

export default ListingsView;
// export default withAuthenticationRequired(ListingsView, {
//   onRedirecting: () => <div>Loading...</div>,
// });
