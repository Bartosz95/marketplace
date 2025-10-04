"use client";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ListingCell from "@/components/ListingCell";
import { Container } from "react-bootstrap";
import NavigationBar from "@/components/NavigationBar";
import Pagination from "react-bootstrap/Pagination";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setOffset, setActivePage, setToken } from "@/lib/redux/listingsSlice";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { getListings } from "@/lib/redux/thunks";

function Main() {
  const dispatch = useAppDispatch();
  const { listings, limit, countOfAll, activePage, theme } = useAppSelector(
    (state) => state.listingsStore
  );

  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const getToken = async () => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
        },
      });
      dispatch(setToken(token));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      getToken();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    dispatch(getListings());
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-bs-theme", theme);
    }
  }, [theme]);

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
