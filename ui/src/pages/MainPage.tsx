"use client";
import { useEffect, useReducer, useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FilterBy, ListingProps } from "@/components/types";
import Listing from "@/components/Listing";
import { Container } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";
import NavigationBar from "@/components/NavigationBar";

function ListingsView() {
  const [listings, setListings] = useState<ListingProps[]>([]);
  const { getAccessTokenSilently } = useAuth0();

  interface State {
    lis: ListingProps[];
  }

  interface Action {
    type: "filterByAllUserListing";
  }

  function reducer(state: State, action: Action) {
    switch (action.type) {
      case "filterByAllUserListing":
        return {
          ...state,
          lis: [], //fetchData(),
        };

      default:
        return { lis: [] };
    }
  }
  const initialState: State = {
    lis: [],
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const getListings = async () => {
    const searchParams = new URLSearchParams();
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
      },
    });
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/listings?${searchParams.toString()}`,
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

  const fetchUserListings = async (filterBy: FilterBy) => {
    const searchParams = new URLSearchParams();

    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
      },
    });

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL
      }/listings/user/${filterBy}${searchParams.toString()}`,
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

  useEffect(() => {
    getListings();
  }, []);

  const filterListing = (filterBy: FilterBy) => {
    console.log(filterBy);
    console.log("filterByUserListing");
    fetchUserListings(filterBy);
  };

  const Listings = (
    <Row key={1}>
      {listings.map((listing, idx) => (
        <Col key={idx} style={{ flex: "0 0 0" }}>
          <Listing {...listing} key={listing.listingId} />
        </Col>
      ))}
    </Row>
  );

  return (
    <>
      <NavigationBar filterListing={filterListing} />
      <Container>{Listings}</Container>
    </>
  );
}

export default ListingsView;
