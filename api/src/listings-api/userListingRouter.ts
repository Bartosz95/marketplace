import { Router } from "express";
import z from "zod";
import { UserListingsDomain } from "./userListingsDomain";

const listingsQuerySchema = z.object({
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
});

const userIdSchema = z.string();

export const UserListingsReadRouter = (userListingsDomain: UserListingsDomain) => {
  const router = Router();

  router.get("/", async (req, res) => {
    const userId = await userIdSchema.parse(req?.auth?.payload?.sub);
    const { limit, offset } = await listingsQuerySchema.parse(req.query);
    const data = await userListingsDomain.getAll(
      userId,
      limit,
      offset
    );
    res.status(200).send(data);
  });

  router.get("/active", async (req, res) => {
    const userId = await userIdSchema.parse(req?.auth?.payload?.sub);
    const { limit, offset } = await listingsQuerySchema.parse(req.query);
    const data = await userListingsDomain.getActive(
      userId,
      limit,
      offset
    );
    res.status(200).send(data);
  });

  router.get("/sold", async (req, res) => {
    const userId = await userIdSchema.parse(req?.auth?.payload?.sub);
    const { limit, offset } = await listingsQuerySchema.parse(req.query);
    const data = await userListingsDomain.getSold(
      userId,
      limit,
      offset
    );
    res.status(200).send(data);
  });

  router.get("/purchased", async (req, res) => {
    const userId = await userIdSchema.parse(req?.auth?.payload?.sub);
    const { limit, offset } = await listingsQuerySchema.parse(req.query);
    const data = await userListingsDomain.getPurchased(
      userId,
      limit,
      offset
    );
    res.status(200).send(data);
  });

  router.get("/archived", async (req, res) => {
    const userId = await userIdSchema.parse(req?.auth?.payload?.sub);

    const { limit, offset } = await listingsQuerySchema.parse(req.query);
    const data = await userListingsDomain.getArchived(
      userId,
      limit,
      offset
    );
    res.status(200).send(data);
  });

  return router;
};
