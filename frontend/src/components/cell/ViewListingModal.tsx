"use client";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Image from "react-bootstrap/Image";
import { Carousel } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { useAuth0 } from "@auth0/auth0-react";
import { setShowListingView } from "@/lib/redux/listingsSlice";
import { listingStoreSelector } from "@/lib/redux/selectors";
import { apiRequest } from "@/lib/apiRequest";

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

function ViewListingModal() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const { showListingView } = useAppSelector(listingStoreSelector);

  if (!showListingView) return;
  const { listingId, title, description, price, imagesUrls } = showListingView;

  const beginCheckout = async () => {
    const { purchaseId } = await apiRequest.post<{ purchaseId: string }>(
      `/listings/${listingId}`,
    );

    // The payment process manager creates the Checkout Session asynchronously.
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const response = await apiRequest.get<{
        status?: string;
        checkoutUrl?: string;
      }>(`/payments/purchases/${purchaseId}/checkout`);
      if (response.checkoutUrl) {
        window.location.assign(response.checkoutUrl);
        return;
      }
      await wait(500);
    }
    throw new Error("Checkout session was not created in time");
  };

  const imagePreview = (
    <Carousel className="mb-3">
      {imagesUrls.map((imageUrl) => (
        <Carousel.Item key={imageUrl}>
          <div className="listing-carousel-frame mb-3">
            <Image
              src={imageUrl}
              alt="listing image"
              className="d-block listing-carousel-image"
              fluid
            />
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );

  console.log(showListingView);

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
            onClick={() => beginCheckout()}
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
