"use client";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Image from "react-bootstrap/Image";
import { Carousel } from "react-bootstrap";
import { Listing, RequestAction } from "../types";
import { useAuth0 } from "@auth0/auth0-react";
import { SendApiRequest } from "@/pages/MainPage";

interface ViewListing {
  show: boolean;
  handleClose: () => void;
  listing: Listing;
  sendApiRequest: SendApiRequest;
}

function ViewListing({
  show,
  handleClose,
  listing,
  sendApiRequest,
}: ViewListing) {
  const { title, description, price, imagesUrls, listingId } = listing;
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  const images = imagesUrls.map((imageUrl) => (
    <Carousel.Item key={imageUrl}>
      <Image src={imageUrl} alt="no image" fluid />
    </Carousel.Item>
  ));

  const handlePurches = async () => {
    await sendApiRequest({ requestAction: RequestAction.Purchase, listingId });
    handleClose();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      aria-labelledby="contained-modal-title-vcenter"
      style={{ margin: "auto" }}
      className="blurred-background"
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Carousel className="mb-3" style={{ width: "90%", margin: "auto" }}>
          {images}
        </Carousel>
        <h4>Price: {price}</h4>
        <p>{description}</p>
      </Modal.Body>
      <Modal.Footer>
        {isAuthenticated ? (
          <Button
            variant="primary"
            style={{ marginLeft: "3" }}
            onClick={handlePurches}
          >
            Buy
          </Button>
        ) : (
          <Button onClick={() => loginWithRedirect()}>Log in to buy</Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default ViewListing;
