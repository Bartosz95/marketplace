"use client";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { listingStoreSelector } from "@/lib/redux/selectors";
import { useEffect, useState } from "react";
import CheckoutForm from "./CheckoutForm";
import { Elements } from "@stripe/react-stripe-js";
import { sendApiV1Request } from "@/lib/sendApiV1Request";
import { setupStripe } from "@/lib/redux/thunks";
import router from "next/router";

function Checkout() {
  const { stripe, showListingView } = useAppSelector(listingStoreSelector);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  if (!showListingView) return router.push("/");
  useEffect(() => {
    dispatch(setupStripe());
  }, []);

  useEffect(() => {
    sendApiV1Request(
      `/purchase/create-payment-intent/${showListingView?.listingId}`,
      {
        method: "POST",
        body: JSON.stringify({}),
      }
    ).then(({ clientSecret }) => {
      setClientSecret(clientSecret);
    });
  }, [stripe]);

  return (
    <>
      {stripe && clientSecret && (
        <Elements stripe={stripe} options={{ clientSecret }}>
          <CheckoutForm />
        </Elements>
      )}
    </>
  );
}

export default Checkout;
