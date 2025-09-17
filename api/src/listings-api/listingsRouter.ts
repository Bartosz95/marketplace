import { Router } from "express";
import { Logger } from "winston";
import z from "zod";
import { UUID } from "crypto";
import { Listings } from "./listingsDomain";

const listingIdSchema = z.uuid();

const ListingReqBodySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(0),
  price: z.number().min(0),
  imageUrls: z.array(z.url()),
});

export type ListingDetails = z.infer<typeof ListingReqBodySchema>;

export const listingsRouter = (listings: Listings, logger: Logger) => {
  const router = Router();

  router.post("/listings", async (req, res) => {
    const data = await ListingReqBodySchema.parse(req.body);
    listings.createListing(data);
    res.status(200).send();
  });

  router.get("/listings", async (req, res) => {
    const data = await listings.getListings();
    res.status(200).send(data);
  });

  router.get("/listings/:listingsID", async (req, res) => {
    const listingId = listingIdSchema.parse(req.params.listingsID) as UUID;
    const listing = await listings.getListing(listingId);
    res.status(200).send(listing);
  });

  router.patch("/listings/:listingsID", async (req, res) => {
    const listingId = listingIdSchema.parse(req.params.listingsID) as UUID;
    const data = await ListingReqBodySchema.parse(req.body);
    listings.updateListing(listingId, data);
    res.status(200).send();
  });

  router.post("/listings/:listingsID", async (req, res) => {
    const listingId = listingIdSchema.parse(req.params.listingsID) as UUID;
    await listings.purchaseListing(listingId);
    res.status(200).send();
  });

  router.delete("/listings/:listingsID", async (req, res) => {
    const listingId = (await listingIdSchema.parse(
      req.params.listingsID
    )) as UUID;
    listings.deleteListing(listingId);
    res.status(200).send();
  });

  return router;
};
