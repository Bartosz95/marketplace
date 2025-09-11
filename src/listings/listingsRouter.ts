import { Router } from "express";
import { Logger } from "winston";
import { ListingsRepository } from "./listingsRepository";
import z from "zod";
import { UUID } from "crypto";


export const listingsRouter = (repository: ListingsRepository, logger: Logger) => {

  const router = Router();

  router.post("/listing/", (req, res) => {
    
    res.status(200);
  });

  const listingIDSchema = z.uuid();

  const listingSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(0),
    price: z.number().min(0),
    imageUrls: z.array(z.url()),
  });

  router.post("/listings", (req, res) => {
    const listing = listingSchema.parse(req.body);
    repository.createListing(listing);
    res.status(200).send();
  });

  router.get("/listings/:listingsID", (req, res) => {
    const listingID = listingIDSchema.parse(req.params.listingsID) as UUID;
    const listing = repository.readListing(listingID) ;
    res.status(200).send(listing);
  });

  router.patch("/listings/:listingsID", (req, res) => {
    const listingID = listingIDSchema.parse(req.params.listingsID) as UUID;
    const listing = listingSchema.parse(req.body);
    repository.updateListing(listingID, listing);
    res.status(200).send();
  });

  router.delete("/listings/:listingsID", (req, res) => {
    const listingID = listingIDSchema.parse(req.params.listingsID) as UUID;
    repository.deleteListing(listingID);
    res.status(200).send();
  });

  router.get("/listings", async (req, res) => {
    const listings = await repository.readListings();
    res.status(200).send(listings);
  });

  return router;
};