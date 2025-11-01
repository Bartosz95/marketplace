"use client";
import { useAppSelector } from "@/lib/redux/hooks";
import { listingStoreSelector } from "@/lib/redux/selectors";
import { useEffect, useState } from "react";
import CheckoutForm from "./CheckoutForm";
import { Elements } from "@stripe/react-stripe-js";
import { sendApiV1Request } from "@/lib/sendApiV1Request";
import { redirect } from "next/navigation";

function Checkout() {
  const { stripe, showListingView } = useAppSelector(listingStoreSelector);
  const [clientSecret, setClientSecret] = useState<string>();

  useEffect(() => {
    if (showListingView)
      sendApiV1Request(
        `/purchase/create-payment-intent/${showListingView?.listingId}`,
        {
          method: "POST",
          body: JSON.stringify({}),
        }
      ).then(({ clientSecret }) => {
        setClientSecret(clientSecret);
      });
  }, [stripe, showListingView]);

  if (!showListingView) return redirect("/");

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
