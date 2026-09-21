import { Router } from "express";
import z from "zod";
import { ListingsDomain } from "./listingsDomain";
import { UUID } from "crypto";

const getListingsQuerychema = z.object({
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
});

export const ListingsReadRouter = (listingsDomain: ListingsDomain) => {
  const router = Router();
  router.get("/", async (req, res) => {
    console.log("GET /listings");
    const { limit, offset } = await getListingsQuerychema.parse(req.query);
    const data = await listingsDomain.getListings(limit, offset);
    res.status(200).send(data);
  });

  router.get("/:userId", async (req, res) => {
    const { limit, offset } = await getListingsQuerychema.parse(req.query);
    const userId = req.params.userId as UUID;
    const data = await listingsDomain.getListingsByUserId(
      userId,
      limit,
      offset,
    );
    res.status(200).send(data);
  });

  return router;
};
