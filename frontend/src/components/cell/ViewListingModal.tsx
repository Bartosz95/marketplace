"use client";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Image from "react-bootstrap/Image";
import { Carousel } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { useAuth0 } from "@auth0/auth0-react";
import { setShowListingView } from "@/lib/redux/listingsSlice";
import { listingStoreSelector } from "@/lib/redux/selectors";
import router from "next/router";

function ViewListingModal() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const { showListingView } = useAppSelector(listingStoreSelector);
  if (!showListingView) return;
  const { title, description, price, imagesUrls } = showListingView;

  const redirectToCheckout = async () => {
    router.push("/checkout");
  };

  const imagePreview = (
    <Carousel className="mb-3">
      {imagesUrls.map((imageUrl) => (
        <Carousel.Item key={imageUrl}>
          <Image
            src={imageUrl}
            alt="listing image"
            className="set-center mb-3"
            fluid
          />
        </Carousel.Item>
      ))}
    </Carousel>
  );

  return (
    <Modal
      show={!!showListingView}
      onHide={() => dispatch(setShowListingView(undefined))}
      backdrop="static"
      aria-labelledby="contained-modal-title-vcenter"
      className="blure m-auto"
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
            className="button-style set-center"
            onClick={redirectToCheckout}
          >
            Buy
          </Button>
        ) : (
          <Button
            onClick={() => loginWithRedirect()}
            className="button-style set-center"
          >
            Log in to buy
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default ViewListingModal;
