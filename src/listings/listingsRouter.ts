import { Router } from "express";
import { Logger } from "winston";
import z from "zod";
import { UUID } from "crypto";
import { Listings } from "../domain/listings";

export const listingsRouter = (listings: Listings, logger: Logger) => {
  const router = Router();

  const listingIDSchema = z.uuid();

  const createListingSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(0),
    price: z.number().min(0),
    imageUrls: z.array(z.url()),
  });

  const updateListingSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(0).optional(),
    price: z.number().min(0).optional(),
    imageUrls: z.array(z.url()).optional(),
  });

  router.post("/listings", async (req, res) => {
    const listing = await createListingSchema.parse(req.body);
    listings.createListing(listing);
    res.status(200).send();
  });

  router.get("/listings", async (req, res) => {
    const listingsResult = await listings.getAllListings();
    res.status(200).send(listingsResult);
  });

  router.get("/listings/:listingsID", async (req, res) => {
    const listingID = listingIDSchema.parse(req.params.listingsID) as UUID;
    const listing = await listings.getListing(listingID);
    res.status(200).send(listing);
  });

  router.patch("/listings/:listingsID", async (req, res) => {
    const listingID = listingIDSchema.parse(req.params.listingsID) as UUID;
    const listing = await updateListingSchema.parse(req.body);
    listings.updateListing(listingID, listing);
    res.status(200).send();
  });

  router.post("/listings/:listingsID", async (req, res) => {
    const listingID = listingIDSchema.parse(req.params.listingsID) as UUID;
    await listings.purchaseListing(listingID);
    res.status(200).send();
  });

  router.delete("/listings/:listingsID", async (req, res) => {
    const listingID = (await listingIDSchema.parse(
      req.params.listingsID
    )) as UUID;
    listings.deleteListing(listingID);
    res.status(200).send();
  });

  return router;
};
