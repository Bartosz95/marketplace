import { Router } from "express";
import z from "zod";
import { UUID } from "crypto";
import { ListingsDomain } from "./listingsDomain";

export const listingIdSchema = z.uuid();

export const ListingsReadRouter = (listingsDomain: ListingsDomain) => {
  const router = Router();
  router.get("/", async (req, res) => {
    const data = await listingsDomain.getListings();
    res.status(200).send(data);
  });

  router.get("/:listingsID", async (req, res) => {
    const listingId = listingIdSchema.parse(req.params.listingsID) as UUID;
    const listing = await listingsDomain.getListing(listingId);
    res.status(200).send(listing);
  });

  return router;
};
