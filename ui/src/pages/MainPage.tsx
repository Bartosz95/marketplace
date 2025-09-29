"use client";
import { useCallback, useEffect, useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FilterBy, Listing, RequestAction } from "@/types";
import ListingCell from "@/components/ListingCell";
import { Container } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";
import NavigationBar from "@/components/NavigationBar";
import { validate } from "uuid";
import { SendRequest } from "@/libs/SendRequest";
import { UUID } from "crypto";
import Pagination from "react-bootstrap/Pagination";
import { InitListingDetails } from "@/components/CreateListing";

export interface ListingDetails {
  title: string;
  description: string;
  price: number;
  images: File[];
}

export interface CreateListing {
  requestAction: RequestAction.Create;
  listingDetails: ListingDetails;
}

export interface UpdateListing {
  requestAction: RequestAction.Update;
  listingId: UUID;
  listingDetails: InitListingDetails;
}

export interface ListingDetails {
  title: string;
  description: string;
  price: number;
  images: File[];
}

export interface ModifyListing {
  requestAction:
    | RequestAction.Purchase
    | RequestAction.Delete
    | RequestAction.Archive
    | RequestAction.Restore;
  listingId: UUID;
}

export type SendApiRequestParams =
  | CreateListing
  | UpdateListing
  | ModifyListing;

export interface SendApiRequest {
  (sendApiRequestParams: SendApiRequestParams): Promise<void>;
}
function ListingsView() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [countOfAll, setCountOfAll] = useState<number>(0);
  const [activePage, setActivePage] = useState<number>(1);
  const [offset, setOffset] = useState<number>(0);
  const [limit] = useState<number>(8);
  const [lastFilterBy, setLastFilterBy] = useState<FilterBy>(FilterBy.All);
  const [token, setToken] = useState<string | undefined>(undefined);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const sendRequest = SendRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/v1`);

  const getListings = useCallback(
    async (filterBy: FilterBy) => {
      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      params.append("offset", offset.toString());
      const result = await sendRequest(
        `/listings${filterBy}?${params.toString()}`,
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
    [token, setLastFilterBy, setListings, limit, offset, sendRequest]
  );

  const sendApiRequest: SendApiRequest = useCallback(
    async (sendApiRequestParams: SendApiRequestParams) => {
      const formData = new FormData();
      const { requestAction } = sendApiRequestParams;
      switch (requestAction) {
        case RequestAction.Create:
          const {
            listingDetails: { title, price, description, images },
          } = sendApiRequestParams;
          formData.append(
            `details`,
            JSON.stringify({ title, price, description })
          );
          for (const image of images) {
            formData.append(`images`, image);
          }
          await sendRequest(`/listings`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });
          break;
        case RequestAction.Update:
          const { listingId, listingDetails } = sendApiRequestParams;
          formData.append(
            `details`,
            JSON.stringify({
              title: listingDetails.title,
              price: listingDetails.price,
              description: listingDetails.description,
            })
          );
          if (listingDetails.images) {
            for (const image of listingDetails.images) {
              formData.append(`images`, image);
            }
          }
          const result = await sendRequest(`/listings/${listingId}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });
          const id = result.listingId;
          if (!id || !validate(id)) throw new Error("Creating listing failed");

          break;
        case RequestAction.Purchase:
          await sendRequest(`/listings/${sendApiRequestParams.listingId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          break;
        case RequestAction.Archive:
          await sendRequest(
            `/listings/archive/${sendApiRequestParams.listingId}`,
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
            `/listings/restore/${sendApiRequestParams.listingId}`,
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
          await sendRequest(`/listings/${sendApiRequestParams.listingId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          break;
      }
      setTimeout(() => {
        getListings(lastFilterBy);
      }, 3000);
    },
    [getListings, sendRequest, lastFilterBy, token]
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
  }, [token, isAuthenticated, getAccessTokenSilently, setToken, lastFilterBy]);

  useEffect(() => {
    getListings(lastFilterBy);
  }, [lastFilterBy, activePage]);

  const Listings = (
    <Row key={1}>
      {listings.map((listing, idx) => (
        <Col key={idx} style={{ flex: "0 0 0" }}>
          <ListingCell
            listing={listing}
            sendApiRequest={sendApiRequest}
            key={listing.listingId}
          />
        </Col>
      ))}
    </Row>
  );

  const changePage = (number: number) => {
    setOffset(limit * (number - 1));
    setActivePage(number);
  };

  const items = [];
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
