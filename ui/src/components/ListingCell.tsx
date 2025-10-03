import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { useState } from "react";
import { Container, Dropdown } from "react-bootstrap";
import { EventType, Listing } from "@/types";
import ViewListing from "@/components/ViewListing";
import UpdateListing from "@/components/UpdateListing";
import "./ListingCell.css";
import { archiveListing, deleteListing, restoreListing } from "@/lib/redux/thunks";
import { useAppDispatch } from "@/lib/redux/hooks";
import { useAuth0 } from "@auth0/auth0-react";

interface ListingCell {
  listing: Listing;
}
function ListingCell({ listing }: ListingCell) {
  const { userId, title, price, imagesUrls, status, listingId } = listing;
  const { user } = useAuth0();

  const dispatch = useAppDispatch();

  const [showListingView, setShowListingView] = useState(false);
  const handleCloseView = () => setShowListingView(false);
  const handleShowView = () => setShowListingView(true);

  const [showListingUpdate, setShowListingUpdate] = useState(false);
  const handleCloseUpdate = () => setShowListingUpdate(false);
  const handleShowUpdate = () => setShowListingUpdate(true);
  const image = imagesUrls[0];

  const handleRestoreListing = async () => {
    dispatch(restoreListing(listingId))
  };

  const handleDeleteListing = async () => {
    dispatch(deleteListing(listingId))
  };

  const handleArchiveListing = async () => {
    dispatch(archiveListing(listingId))
  };

  const isUserListing =
    user?.sub === userId && status !== EventType.LISTING_PURCHASED;

  const viewButton = (
    <Button style={{ width: "10rem" }} onClick={handleShowView}>
      View
    </Button>
  );

  const archiveButton =
    status === EventType.LISTING_ARCHIVED ? (
      <Dropdown.Item onClick={handleRestoreListing}>Restore</Dropdown.Item>
    ) : (
      <Dropdown.Item onClick={handleArchiveListing}>Archive</Dropdown.Item>
    );

  const modifyDropdown = (
    <Dropdown>
      <Dropdown.Toggle style={{ width: "10rem" }} id="dropdown-basic">
        Modify
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={handleShowUpdate}>Update</Dropdown.Item>
        {archiveButton}
        <Dropdown.Item onClick={handleDeleteListing}>Delete</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );

  const listingActionButton = isUserListing ? modifyDropdown : viewButton;

  return (
    <>
      <Card style={{ width: "18rem" }} className="mt-3 blure">
        <Card.Body>
          <Card.Img variant="top" src={image} />
          <Card.Title>{title}</Card.Title>
          <Card.Text>Price: {price}</Card.Text>
          <Container className="d-flex justify-content-center">
            {listingActionButton}
          </Container>
        </Card.Body>
      </Card>
      <ViewListing
        show={showListingView}
        handleClose={handleCloseView}
        listing={listing}
      />
      <UpdateListing
        show={showListingUpdate}
        handleClose={handleCloseUpdate}
        listing={listing}
      />
    </>
  );
}

export default ListingCell;
