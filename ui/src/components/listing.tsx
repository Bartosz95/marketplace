"use client";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import ViewListing from "@/components/ViewListing";
import { ListingProps } from "@/components/types";
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Dropdown } from "react-bootstrap";

function Listing(listingProps: ListingProps) {
  const { imagesUrls, price, title, userId, listingId } = listingProps;
  const { user, getAccessTokenSilently } = useAuth0();

  const [showListingView, setShowListingView] = useState(false);
  const handleClose = () => setShowListingView(false);
  const handleShow = () => setShowListingView(true);
  const image =
    imagesUrls.length > 0
      ? `${process.env.NEXT_PUBLIC_IMAGES_URL}/${imagesUrls[0]}`
      : `${process.env.PUBLIC_URL}/no-image.png`;

  const isUserListing = user?.sub === userId;

  const editListing = () => {
    console.log("edit");
  };

  const deleteListing = async () => {
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
      },
    });
    const options = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/listings/${listingId}`,
      options
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  };

  const archiveListing = () => {
    console.log("archive");
  };

  const modifyListing = (
    <Dropdown>
      <Dropdown.Toggle id="dropdown-basic">Modify</Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={handleShow}>View</Dropdown.Item>
        <Dropdown.Item onClick={editListing}>Edit</Dropdown.Item>
        <Dropdown.Item onClick={archiveListing}>Archive</Dropdown.Item>
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
            <Button onClick={handleShow}>View</Button>
          )}
        </Card.Body>
      </Card>
      <ViewListing
        show={showListingView}
        handleClose={handleClose}
        listingProps={listingProps}
      />
    </>
  );
}

export default Listing;
