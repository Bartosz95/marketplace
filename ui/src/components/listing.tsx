import { UUID } from "crypto";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import ViewListing from "./ViewListing";
import { ListingProps } from "./types";
import { useState } from "react";

function Listing(listingProps: ListingProps) {
  const { description, imagesUrls, listingId, price, title } = listingProps;

  const [showListingView, setShowListingView] = useState(false);
  const handleClose = () => setShowListingView(false);
  const handleShow = () => setShowListingView(true);
  const image =
    imagesUrls.length > 0
      ? `${process.env.NEXT_PUBLIC_IMAGES_URL}/${imagesUrls[0]}`
      : ``;

  return (
    <>
      <Card style={{ width: "18rem" }} className="mt-3">
        <Card.Body>
          <Card.Img variant="top" src={image} />
          <Card.Title>{title}</Card.Title>
          <Card.Text>Price: {price}</Card.Text>
          <Button onClick={handleShow}>View</Button>
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
function setShow(arg0: boolean) {
  throw new Error("Function not implemented.");
}
