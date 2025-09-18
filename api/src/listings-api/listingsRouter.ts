import { Router } from "express";
import { Logger } from "winston";
import z from "zod";
import { UUID } from "crypto";
import { Listings } from "./listingsDomain";

export const listingIdSchema = z.uuid();

const createListingReqBodySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(0),
  price: z.coerce.number().min(0),
  imagesUrls: z.array(z.string()),
});

const updateListingReqBodySchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(0).optional(),
  price: z.coerce.number().min(0).optional(),
  imageUrls: z.array(z.string()).optional(),
});

export type CreateListingReqBody = z.infer<typeof createListingReqBodySchema>;

export type UpdateListingReqBody = z.infer<typeof updateListingReqBodySchema>;

export const listingsRouter = (listings: Listings, logger: Logger) => {
  const router = Router();

  router.post("/", async (req, res) => {
    const data = await createListingReqBodySchema.parse(req.body);
    const listingId = await listings.createListing(data);
    res.status(200).send({ listingId: listingId });
  });

  router.get("/", async (req, res) => {
    const data = await listings.getListings();
    res.status(200).send(data);
  });

  router.get("/:listingsID", async (req, res) => {
    const listingId = listingIdSchema.parse(req.params.listingsID) as UUID;
    const listing = await listings.getListing(listingId);
    res.status(200).send(listing);
  });

  router.patch("/:listingsID", async (req, res, next) => {
    const listingId = listingIdSchema.parse(req.params.listingsID) as UUID;
    const data = await updateListingReqBodySchema.parse(req.body);
    await listings.updateListing(listingId, data);
    res.status(200).send();
  });

  router.post("/:listingsID", async (req, res) => {
    const listingId = listingIdSchema.parse(req.params.listingsID) as UUID;
    await listings.purchaseListing(listingId);
    res.status(200).send();
  });

  router.delete("/:listingsID", async (req, res) => {
    const listingId = (await listingIdSchema.parse(
      req.params.listingsID
    )) as UUID;
    await listings.deleteListing(listingId);
    res.status(200).send();
  });

  return router;
};
