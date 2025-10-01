"use client";
import { useEffect, useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FilterBy, Listing } from "@/types";
import ListingCell from "@/components/ListingCell";
import { Container } from "react-bootstrap";
import NavigationBar from "@/components/NavigationBar";
import Pagination from "react-bootstrap/Pagination";
import { useAuthContext } from "@/providers/AuthContext";
import { sendApiV1Request } from "@/helpers/sendApiV1Request";

function ListingsView() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [countOfAll, setCountOfAll] = useState<number>(0);
  const [activePage, setActivePage] = useState<number>(1);
  const [offset, setOffset] = useState<number>(0);
  const [limit] = useState<number>(8);
  const [lastFilterBy, setLastFilterBy] = useState<FilterBy>(FilterBy.All);
  const { token } = useAuthContext();

  const getListings = async () => {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());
    const result = await sendApiV1Request(
      `/listings${lastFilterBy}?${params.toString()}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );
    setListings(result.listings);
    setCountOfAll(result.countOfAll);
  };

  useEffect(() => {
    getListings();
  }, [lastFilterBy, activePage, token]);

  const Listings = (
    <Row key="listings">
      {listings.map((listing, idx) => (
        <Col key={idx} style={{ flex: "0 0 0" }}>
          <ListingCell listing={listing} key={listing.listingId} />
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
        lastFilterBy={lastFilterBy}
        setLastFilterBy={setLastFilterBy}
      />
      <Container>{Listings}</Container>
      <Container className="d-flex justify-content-center mt-3">
        <Pagination>{items}</Pagination>
      </Container>
    </>
  );
}

export default ListingsView;
