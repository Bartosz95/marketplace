import { Router } from "express";
import z from "zod";
import { UUID } from "crypto";
import { ListingsDomain } from "./listingsDomain";
import { FilterBy } from "../types";

const getListingsQuerychema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
});

const filterSchema = z.enum(FilterBy);

const userIdSchema = z.string();

export const ListingsReadRouter = (listingsDomain: ListingsDomain) => {
  const router = Router();
  router.get("/", async (req, res) => {
    const { limit, offset } = await getListingsQuerychema.parse(req.query);
    const data = await listingsDomain.getListings(limit, offset);
    res.status(200).send(data);
  });

  router.get("/user/:filter", async (req, res) => {
    const userId = await userIdSchema.parse(req?.auth?.payload?.sub);
    const filter = await filterSchema.parse(req.params.filter);
    const { limit, offset } = await getListingsQuerychema.parse(req.query);
    const data = await listingsDomain.getUserListings(
      userId,
      filter,
      limit,
      offset
    );
    res.status(200).send(data);
  });

  return router;
};
