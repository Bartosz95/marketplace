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

  return (
    <>
      <Card style={{ width: "18rem" }}>
        <Card.Body>
          <Card.Img
            variant="top"
            className="width: 20%"
            src={`http://localhost:3000/images/${listingId}/${imagesUrls[0]}`}
          />
          <Card.Title>{title}</Card.Title>
          <Card.Subtitle>Price: {price}</Card.Subtitle>
          <Card.Text className="card-text">{description}</Card.Text>
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
