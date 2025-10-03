"use client";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ListingCell from "@/components/ListingCell";
import { Container } from "react-bootstrap";
import NavigationBar from "@/components/NavigationBar";
import Pagination from "react-bootstrap/Pagination";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setOffset, setActivePage } from "@/lib/redux/listingsSlice";

function Main() {
  const dispatch = useAppDispatch();
  const { listings, limit, countOfAll, activePage } = useAppSelector(
    (state) => state.listingsStore
  );

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
    dispatch(setOffset(limit * (number - 1)));
    dispatch(setActivePage(number));
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
      <NavigationBar />
      <Container>{Listings}</Container>
      <Container className="d-flex justify-content-center mt-3">
        <Pagination>{items}</Pagination>
      </Container>
    </>
  );
}

export default Main;
