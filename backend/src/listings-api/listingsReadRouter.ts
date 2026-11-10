import { Router } from "express";
import z from "zod";
import { ListingsDomain } from "./listingsDomain";
import { UUID } from "crypto";

const getListingsQuerychema = z.object({
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
});

const getListingParamsSchema = z.uuid();

export const ListingsReadRouter = (listingsDomain: ListingsDomain) => {
  const router = Router();
  router.get("/", async (req, res) => {
    const { limit, offset } = await getListingsQuerychema.parse(req.query);
    const data = await listingsDomain.getListings(limit, offset);
    res.status(200).send(data);
  });

  router.get("/:listingId", async (req, res) => {
    const listingId = (await getListingParamsSchema.parse(
      req.params.listingId,
    )) as UUID;
    const data = await listingsDomain.getListing(listingId);
    res.status(200).send(data);
  });

  return router;
};
