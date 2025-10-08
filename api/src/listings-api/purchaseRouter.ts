import { Router } from "express";
import { ListingsDomain } from "./domain/listingsDomain";
import { UUID } from "crypto";
import { listingIdSchema, EnvPurchase } from "../libs/validationSchemas";
import Stripe from "stripe";

export const PurchaseRouter = (
  listingsDomain: ListingsDomain,
  env: EnvPurchase
) => {
  const router = Router();
  const stripe = new Stripe(env.secretKey);

  router.get("/config", (req, res) => {
    res.send({
      publishableKey: env.publishableKey,
    });
  });

  router.post("/create-payment-intent/:listingId", async (req, res) => {
    console.log(req);
    const listingId = (await listingIdSchema.parse(
      req.params.listingId
    )) as UUID;

    const linsting = await listingsDomain.getListingById(listingId);

    const amount = Number(linsting?.price) * 10;

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        currency: "aud",
        amount,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      res.status(200).send({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send();
    }
  });
  return router;
};
