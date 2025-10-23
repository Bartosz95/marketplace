"use client";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { listingStoreSelector } from "@/lib/redux/selectors";
import { purchaseListing } from "@/lib/redux/thunks";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { PaymentElement } from "@stripe/react-stripe-js";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Container, Form, Modal } from "react-bootstrap";

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useAppDispatch();
  const [message, setMessage] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const { showListingView: listing } = useAppSelector(listingStoreSelector);
  const router = useRouter();

  if (!listing) redirect("/");

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}`,
      },
    });

    if (error) {
      setMessage(error.message);
    }
    dispatch(purchaseListing(listing.listingId));

    setIsProcessing(false);
    router.push(`/`);
  };
  return (
    <Container>
      <Modal
        show={true}
        backdrop="static"
        aria-labelledby="contained-modal-title-vcenter"
        className="modal-view m-auto"
        size="lg"
        centered
      >
        <Modal.Header>
          <Modal.Title>Checkout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <PaymentElement />
            <Button
              disabled={isProcessing}
              type="submit"
              className="button-style set-center"
            >
              Purchase
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>{message}</Modal.Footer>
      </Modal>
    </Container>
  );
}

export default CheckoutForm;
