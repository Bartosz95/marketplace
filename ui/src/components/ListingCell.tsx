"use client";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import ViewListing from "@/components/ViewListing";
import { EventType, Listing, RequestAction } from "@/types";
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Container, Dropdown } from "react-bootstrap";
import EditListing from "./EditListing";
import { SendApiRequest } from "@/pages/MainPage";

interface ListingCell {
  listing: Listing;
  sendApiRequest: SendApiRequest;
}

function ListingCell({ listing, sendApiRequest }: ListingCell) {
  const { userId, title, price, imagesUrls, status, listingId } = listing;
  const { user } = useAuth0();

  const [showListingView, setShowListingView] = useState(false);
  const handleCloseView = () => setShowListingView(false);
  const handleShowView = () => setShowListingView(true);

  const [showListingEdit, setShowListingEdit] = useState(false);
  const handleCloseEdit = () => setShowListingEdit(false);
  const handleShowEdit = () => setShowListingEdit(true);
  const image = imagesUrls[0];

  const allowEdit =
    user?.sub === userId && status !== EventType.LISTING_PURCHASED;

  const archiveListing = async () => {
    await sendApiRequest({ requestAction: RequestAction.Archive, listingId });
  };

  const restoreListing = async () => {
    await sendApiRequest({ requestAction: RequestAction.Restore, listingId });
  };

  const deleteListing = async () => {
    sendApiRequest({ requestAction: RequestAction.Delete, listingId });
  };

  const modifyListing = (
    <Dropdown>
      <Dropdown.Toggle style={{ width: "10rem" }} id="dropdown-basic">
        Modify
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={handleShowEdit}>Edit</Dropdown.Item>
        {status === EventType.LISTING_ARCHIVED ? (
          <Dropdown.Item onClick={restoreListing}>Restore</Dropdown.Item>
        ) : (
          <Dropdown.Item onClick={archiveListing}>Archive</Dropdown.Item>
        )}
        <Dropdown.Item onClick={deleteListing}>Delete</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );

  return (
    <>
      <Card style={{ width: "18rem" }} className="mt-3">
        <Card.Body>
          <Card.Img variant="top" src={image} />
          <Card.Title>{title}</Card.Title>
          <Card.Text>Price: {price}</Card.Text>
          <Container className="d-flex justify-content-center">
            {allowEdit ? (
              modifyListing
            ) : (
              <Button style={{ width: "10rem" }} onClick={handleShowView}>
                View
              </Button>
            )}
          </Container>
        </Card.Body>
      </Card>
      <ViewListing
        show={showListingView}
        handleClose={handleCloseView}
        listing={listing}
        sendApiRequest={sendApiRequest}
      />
      <EditListing
        show={showListingEdit}
        handleClose={handleCloseEdit}
        listing={listing}
        sendApiRequest={sendApiRequest}
        requestAction={RequestAction.Update}
      />
    </>
  );
}

export default ListingCell;
