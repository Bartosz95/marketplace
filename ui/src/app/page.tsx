"use client";
import ListingCell from "@/components/cell/ListingCell";
import ViewListingModal from "@/components/cell/ViewListingModal";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setOffset, setActivePage } from "@/lib/redux/listingsSlice";
import { listingStoreSelector } from "@/lib/redux/selectors";
import { getListings } from "@/lib/redux/thunks";
import { useEffect, useMemo } from "react";
import { Container, Row, Col, Pagination } from "react-bootstrap";

export default function Page() {
  const dispatch = useAppDispatch();
  const { listings, limit, activePage, pagesNumbers } =
    useAppSelector(listingStoreSelector);

  useEffect(() => {
    dispatch(getListings());
  }, [activePage]);

  const ListingsCells = useMemo(
    () => (
      <Container>
        <Row key="listings">
          {listings.map((listing, idx) => (
            <Col key={idx} className="no-flex">
              <ListingCell listing={listing} key={listing.listingId} />
            </Col>
          ))}
        </Row>
      </Container>
    ),
    [listings]
  );

  const Pages = (
    <Container className="d-flex justify-content-center mt-3">
      <Pagination>
        {pagesNumbers.map((pageNumber) => (
          <Pagination.Item
            key={pageNumber}
            active={pageNumber === activePage}
            onClick={() => changePage(pageNumber)}
          >
            {pageNumber}
          </Pagination.Item>
        ))}
      </Pagination>
    </Container>
  );

  const changePage = (number: number) => {
    dispatch(setOffset(limit * (number - 1)));
    dispatch(setActivePage(number));
  };

  return (
    <>
      <ViewListingModal />

      {ListingsCells}
      {Pages}
    </>
  );
}
