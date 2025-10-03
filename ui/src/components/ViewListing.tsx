"use client";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Image from "react-bootstrap/Image";
import { Carousel } from "react-bootstrap";
import { Listing } from "../types";
import { useAppDispatch } from "@/lib/redux/hooks";
import { purchaseListing } from "@/lib/redux/thunks";
import { useAuth0 } from "@auth0/auth0-react";

interface ViewListing {
  show: boolean;
  handleClose: () => void;
  listing: Listing;
}

function ViewListing({ show, handleClose, listing }: ViewListing) {
  const { title, description, price, imagesUrls, listingId } = listing;
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const dispatch = useAppDispatch();

  const handlePurches = async () => {
    dispatch(purchaseListing(listingId))
    handleClose();
  };

  const imagePreview = (
    <Carousel className="mb-3 image-preview">
      {imagesUrls.map((imageUrl) => (
        <Carousel.Item key={imageUrl}>
          <Image alt="no image" src={imageUrl} fluid />
        </Carousel.Item>
      ))}
    </Carousel>
  );

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      aria-labelledby="contained-modal-title-vcenter"
      className="modal-view"
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {imagePreview}
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
