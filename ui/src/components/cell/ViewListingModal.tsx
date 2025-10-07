"use client";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Image from "react-bootstrap/Image";
import { Carousel } from "react-bootstrap";
import { Listing } from "../../types";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { purchaseListing } from "@/lib/redux/thunks";
import { useAuth0 } from "@auth0/auth0-react";
import { setShowListingView } from "@/lib/redux/listingsSlice";
import { listingStoreSelector } from "@/lib/redux/selectors";

interface ViewListing {
  listing: Listing;
}

function ViewListing({ listing }: ViewListing) {
  const { title, description, price, imagesUrls, listingId } = listing;
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const { showListingView } = useAppSelector(listingStoreSelector);

  const dispatch = useAppDispatch();

  const handlePurches = async () => {
    dispatch(purchaseListing(listingId));
    dispatch(setShowListingView(false));
  };

  const imagePreview = (
    <Carousel className="mb-3 image-preview">
      {imagesUrls.map((imageUrl) => (
        <Carousel.Item key={imageUrl} className="image-carousel-item-my">
          <Image
            src={imageUrl}
            alt="preview"
            className="carousel-img-my"
            fluid
          />
        </Carousel.Item>
      ))}
    </Carousel>
  );

  return (
    <Modal
      show={showListingView === listingId}
      onHide={() => dispatch(setShowListingView(false))}
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
          <Button href="/checkout">Checkout</Button>
        ) : (
          // <CheckoutButton />
          // <Button
          //   variant="primary"
          //   className="ml-3"
          //   style={{ width: "10rem", margin: "auto" }}
          //   onClick={handlePurches}
          // >
          //   Buy
          // </Button>
          <Button onClick={() => loginWithRedirect()}>Log in to buy</Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default ViewListing;
