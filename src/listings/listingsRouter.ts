import { Router } from "express";
import { Logger } from "winston";
import { ListingsRepository } from "./listingsRepository";
import z from "zod";


export const listingsRouter = (repository: ListingsRepository, logger: Logger) => {

  const router = Router();

  router.post("/listing/", (req, res) => {
    
    res.status(200);
  });

  const listingIDSchema = z.string().min(1);

  router.get("/listings/:listingsID", (req, res) => {
    const listingID = listingIDSchema.parse(req.params.listingsID);
    res.status(200).send(`Listings: ${listingID}`);
  });

  router.get("/listings", async (req, res) => {
    const listings = await repository.getListings();
    res.status(200).send(listings);
  });
  

  return router;
};