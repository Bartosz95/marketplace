"use client";
import { useEffect, useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FilterBy, ListingProps, EventType, RequestAction } from "@/types";
import ListingCell from "@/components/ListingCell";
import { Container } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";
import NavigationBar from "@/components/NavigationBar";
import { validate } from "uuid";
import { sendRequest } from "@/libs/sendRequest";
import { UUID } from "crypto";

export interface SendApiRequest {
  (
    requestAction: RequestAction,
    listingProps: ListingProps,
    images?: File[]
  ): Promise<void>;
}
function ListingsView() {
  const [listings, setListings] = useState<ListingProps[]>([]);
  const [token, setToken] = useState<string>();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const getListings = async (filterBy: FilterBy) => {
    try {
      const params = new URLSearchParams();
      params.append("limit", "100");
      params.append("offset", "0");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/listings${filterBy}?${params.toString()}`,
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
    } catch (error) {
      console.log(error);
    }
  };

  const sendImages = async (images: File[], listingId: UUID) => {
    if (images?.length > 0) {
      const formData = new FormData();
      for (const image of images) {
        formData.append(`images`, image);
      }
      await sendRequest(`${process.env.NEXT_PUBLIC_IMAGES_URL}/${listingId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
    }
  };

  const sendApiRequest: SendApiRequest = async (
    requestAction: RequestAction,
    listingProps: ListingProps,
    images?: File[]
  ) => {
    switch (requestAction) {
      case RequestAction.Create:
        if (!images) throw new Error(`Action require images`);
        const result = await sendRequest(
          `${process.env.NEXT_PUBLIC_API_URL}/listings`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: listingProps.title,
              price: listingProps.price,
              description: listingProps.description,
            }),
          }
        );
        const listingId = result.listingId;
        if (!listingId || !validate(listingId))
          throw new Error("Creating listing failed");
        await sendImages(images, listingId);
        break;
      case RequestAction.Update:
        await sendRequest(
          `${process.env.NEXT_PUBLIC_API_URL}/listings/${listingId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: listingProps.title,
              price: listingProps.price,
              description: listingProps.description,
            }),
          }
        );
        if (images) await sendImages(images, listingId);
        break;
      case RequestAction.Purchase:
        await sendRequest(
          `${process.env.NEXT_PUBLIC_API_URL}/listings/${listingId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        break;
      case RequestAction.Archive:
        await sendRequest(
          `${process.env.NEXT_PUBLIC_API_URL}/listings/archive/${listingId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        break;
      case RequestAction.Restore:
        await sendRequest(
          `${process.env.NEXT_PUBLIC_API_URL}/listings/restore/${listingId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        break;
    }
  };

  const initApp = async () => {
    if (isAuthenticated && !token) {
      const t = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
        },
      });
      setToken(t);
    }
    await getListings(FilterBy.All);
  };
  useEffect(() => {
    initApp();
  }, [token]);

  const Listings = (
    <Row key={1}>
      {listings.map((listing, idx) => (
        <Col key={idx} style={{ flex: "0 0 0" }}>
          <ListingCell
            listingProps={listing}
            sendApiRequest={sendApiRequest}
            key={listing.listingId}
          />
        </Col>
      ))}
    </Row>
  );

  return (
    <>
      <NavigationBar
        getListings={getListings}
        sendApiRequest={sendApiRequest}
      />
      <Container>{Listings}</Container>
    </>
  );
}

export default ListingsView;
