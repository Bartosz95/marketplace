"use client";
import { useCallback, useEffect, useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FilterBy, ListingProps, RequestAction } from "@/types";
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
  const [lastFilterBy, setLastFilterBy] = useState<FilterBy>(FilterBy.All);
  const [token, setToken] = useState<string | undefined>(undefined);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const getListings = useCallback(
    async (filterBy: FilterBy) => {
      const params = new URLSearchParams();
      params.append("limit", "100");
      params.append("offset", "0");
      const result = await sendRequest(
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
      await setLastFilterBy(filterBy);
      await setListings(result);
    },
    [token, setLastFilterBy, setListings, lastFilterBy]
  );

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

  const sendApiRequest: SendApiRequest = useCallback(
    async (
      requestAction: RequestAction,
      listingProps: ListingProps,
      images?: File[]
    ) => {
      const listingId = listingProps.listingId;
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
          const id = result.listingId;
          if (!id || !validate(id)) throw new Error("Creating listing failed");
          await sendImages(images, id);
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
          if (images && listingId) await sendImages(images, listingId);
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
        case RequestAction.Delete:
          await sendRequest(
            `${process.env.NEXT_PUBLIC_API_URL}/listings/restore/${listingId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          break;
      }
      getListings(lastFilterBy);
    },
    [getListings, sendRequest, lastFilterBy]
  );

  useEffect(() => {
    const initApp = async () => {
      if (isAuthenticated && !token) {
        const t = await getAccessTokenSilently({
          authorizationParams: {
            audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
          },
        });
        setToken(t);
      }
    };
    initApp();
    getListings(lastFilterBy);
  }, [
    token,
    isAuthenticated,
    getAccessTokenSilently,
    setToken,
    getListings,
    lastFilterBy,
  ]);

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
