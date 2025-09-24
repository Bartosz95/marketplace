"use client";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import ViewListing from "@/components/ViewListing";
import { EventType, ListingProps } from "@/components/types";
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Dropdown } from "react-bootstrap";
import EditListing from "./EditListing";

interface ListingModalInterface {
  listingProps: ListingProps;
  sendUpdateListingRequest: (
    listingProps: ListingProps,
    images: File[]
  ) => Promise<void>;
  sendArchiveListingRequest: (listingProps: ListingProps) => Promise<void>;
  sendDeleteListingRequest: (listingProps: ListingProps) => Promise<void>;
  sendRestoreListingRequest: (listingProps: ListingProps) => Promise<void>;
}

function Listing({
  listingProps,
  sendUpdateListingRequest,
  sendArchiveListingRequest,
  sendRestoreListingRequest,
  sendDeleteListingRequest,
}: ListingModalInterface) {
  const { userId, title, price, imagesUrls, status } = listingProps;
  const { user } = useAuth0();

  const [showListingView, setShowListingView] = useState(false);
  const handleCloseView = () => setShowListingView(false);
  const handleShowView = () => setShowListingView(true);

  const [showListingEdit, setShowListingEdit] = useState(false);
  const handleCloseEdit = () => setShowListingEdit(false);
  const handleShowEdit = () => setShowListingEdit(true);
  const image =
    imagesUrls.length > 0
      ? `${process.env.NEXT_PUBLIC_IMAGES_URL}/${imagesUrls[0]}`
      : `${process.env.PUBLIC_URL}/no-image.png`;

  const isUserListing = user?.sub === userId;

  const archiveListing = async () => {
    await sendArchiveListingRequest(listingProps);
  };

  const restoreListing = async () => {
    await sendRestoreListingRequest(listingProps);
  };

  const deleteListing = async () => {
    await sendDeleteListingRequest(listingProps);
  };

  const modifyListing = (
    <Dropdown>
      <Dropdown.Toggle id="dropdown-basic">Modify</Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={handleShowView}>View</Dropdown.Item>
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

          {isUserListing ? (
            modifyListing
          ) : (
            <Button onClick={handleShowView}>View</Button>
          )}
        </Card.Body>
      </Card>
      <ViewListing
        show={showListingView}
        handleClose={handleCloseView}
        listingProps={listingProps}
      />
      <EditListing
        show={showListingEdit}
        handleClose={handleCloseEdit}
        listingProps={listingProps}
        sendRequest={sendUpdateListingRequest}
      />
    </>
  );
}

export default Listing;
