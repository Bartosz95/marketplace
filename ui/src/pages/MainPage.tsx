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
import Pagination from "react-bootstrap/Pagination";

export interface SendApiRequest {
  (
    requestAction: RequestAction,
    listingProps: ListingProps,
    images?: File[]
  ): Promise<void>;
}
function ListingsView() {
  const [listings, setListings] = useState<ListingProps[]>([]);
  const [countOfAll, setCountOfAll] = useState<number>(0);
  const [activePage, setActivePage] = useState<number>(1);
  const [offset, setOffset] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [lastFilterBy, setLastFilterBy] = useState<FilterBy>(FilterBy.All);
  const [token, setToken] = useState<string | undefined>(undefined);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const getListings = useCallback(
    async (filterBy: FilterBy) => {
      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      params.append("offset", offset.toString());
      console.log("limit");
      console.log(limit);
      console.log("offset");
      console.log(offset);
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
      setLastFilterBy(filterBy);
      setListings(result.listings);
      setCountOfAll(result.countOfAll);
    },
    [token, setLastFilterBy, setListings, lastFilterBy, limit, offset]
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
            `${process.env.NEXT_PUBLIC_API_URL}/listings/${listingId}`,
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
      setTimeout(() => {
        getListings(lastFilterBy);
      }, 2000);
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

  const changePage = (number: number) => {
    console.log(number);
    setOffset(limit * (number - 1));
    setActivePage(number);
  };

  let items = [];
  if (countOfAll > limit) {
    for (let number = 1; number <= countOfAll / limit + 1; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === activePage}
          onClick={() => changePage(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
  }

  return (
    <>
      <NavigationBar
        getListings={getListings}
        sendApiRequest={sendApiRequest}
      />
      <Container>{Listings}</Container>
      <Container className="d-flex justify-content-center mt-3">
        <Pagination>{items}</Pagination>
      </Container>
    </>
  );
}

export default ListingsView;
