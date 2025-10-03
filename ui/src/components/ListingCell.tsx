import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { useState } from "react";
import { Container, Dropdown } from "react-bootstrap";
import { EventType, Listing } from "@/types";
import ViewListing from "@/components/ViewListing";
import UpdateListing from "@/components/UpdateListing";
import "./ListingCell.css";
import {
  archiveListing,
  deleteListing,
  restoreListing,
} from "@/lib/redux/thunks";
import { useAppDispatch } from "@/lib/redux/hooks";
import { useAuth0 } from "@auth0/auth0-react";
import {
  setShowListingUpdate,
  setShowListingView,
} from "@/lib/redux/listingsSlice";

interface ListingCell {
  listing: Listing;
}
function ListingCell({ listing }: ListingCell) {
  const { userId, title, price, imagesUrls, status, listingId } = listing;
  const { user } = useAuth0();
  const dispatch = useAppDispatch();

  const isUserListing =
    user?.sub === userId && status !== EventType.LISTING_PURCHASED;

  const viewButton = (
    <Button
      style={{ width: "10rem" }}
      onClick={() => {
        dispatch(setShowListingView(listingId));
      }}
    >
      View
    </Button>
  );

  const archiveButton =
    status === EventType.LISTING_ARCHIVED ? (
      <Dropdown.Item onClick={() => dispatch(restoreListing(listingId))}>
        Restore
      </Dropdown.Item>
    ) : (
      <Dropdown.Item onClick={() => dispatch(archiveListing(listingId))}>
        Archive
      </Dropdown.Item>
    );

  const modifyDropdown = (
    <Dropdown>
      <Dropdown.Toggle style={{ width: "10rem" }} id="dropdown-basic">
        Modify
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item
          onClick={() => dispatch(setShowListingUpdate(listingId))}
        >
          Update
        </Dropdown.Item>
        {archiveButton}
        <Dropdown.Item onClick={() => dispatch(deleteListing(listingId))}>
          Delete
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );

  const listingActionButton = isUserListing ? modifyDropdown : viewButton;

  return (
    <>
      <Card style={{ width: "18rem" }} className="mt-3 blure">
        <Card.Body>
          <Card.Img variant="top" src={imagesUrls[0]} />
          <Card.Title>{title}</Card.Title>
          <Card.Text>Price: {price}</Card.Text>
          <Container className="d-flex justify-content-center">
            {listingActionButton}
          </Container>
        </Card.Body>
      </Card>
      <ViewListing listing={listing} />
      <UpdateListing listing={listing} />
    </>
  );
}

export default ListingCell;
