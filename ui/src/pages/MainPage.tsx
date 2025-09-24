"use client";
import { useEffect, useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FilterBy, ListingProps } from "@/components/types";
import Listing from "@/components/Listing";
import { Container } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";
import NavigationBar from "@/components/NavigationBar";
import { UUID } from "crypto";
import { validate } from "uuid";

function ListingsView() {
  const [listings, setListings] = useState<ListingProps[]>([]);
  const [token, setToken] = useState<string>();
  const { getAccessTokenSilently } = useAuth0();

  const getListings = async (token: string) => {
    console.log("token");
    console.log(token);
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
    setListings(result);
  };

  const getUserListings = async (filterBy: FilterBy) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/listings/user/${filterBy}}`,
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

  const sendImages = async (images: File[], listingId: UUID) => {
    if (images && images?.length > 0) {
      const formData = new FormData();
      for (const image of images) {
        formData.append(`images`, image);
      }
      const options = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      };
      await fetch(
        `${process.env.NEXT_PUBLIC_IMAGES_URL}/${listingId}`,
        options
      );
    }
  };

  const sendCreateListingRequest = async (
    listingProps: ListingProps,
    images: File[]
  ) => {
    const { title, price, description, imagesUrls } = listingProps;
    const data = {
      title,
      price,
      description,
      imagesUrls,
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/listings`,
      options
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    const listingId = result.listingId;
    if (!listingId || !validate(listingId))
      throw new Error("Creating listing failed");
    await sendImages(images, listingId);
  };

  const sendUpdateListingRequest = async (
    listingProps: ListingProps,
    images: File[]
  ) => {
    const { listingId, title, price, description, imagesUrls } = listingProps;
    if (!listingId) throw new Error("Cannot get listingId");
    const data = {
      title,
      price,
      description,
      imagesUrls,
    };
    const options = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/listings/:${listingId}`,
      options
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    await sendImages(images, listingId);
  };

  const sendDeleteListingRequest = async (listingProps: ListingProps) => {
    const { listingId } = listingProps;
    if (!listingId) throw new Error("Cannot get listingId");
    const options = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/listings/:${listingId}`,
      options
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  };

  const sendArchiveListingRequest = async (listingProps: ListingProps) => {
    const { listingId } = listingProps;
    if (!listingId) throw new Error("Cannot get listingId");
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/listings/:${listingId}`,
      options
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      const t = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
        },
      });
      setToken(t);
      await getListings(t);
    };
    initApp();
  }, []);

  const Listings = (
    <Row key={1}>
      {listings.map((listing, idx) => (
        <Col key={idx} style={{ flex: "0 0 0" }}>
          <Listing
            listingProps={listing}
            sendUpdateListingRequest={sendUpdateListingRequest}
            sendArchiveListingRequest={sendArchiveListingRequest}
            sendDeleteListingRequest={sendDeleteListingRequest}
            key={listing.listingId}
          />
        </Col>
      ))}
    </Row>
  );

  return (
    <>
      <NavigationBar
        getUserListings={getUserListings}
        sendCreateListingRequest={sendCreateListingRequest}
      />
      <Container>{Listings}</Container>
    </>
  );
}

export default ListingsView;
