import { Router } from "express";
import z from "zod";
import { UsersDomain } from "../users-api/usersDomain";
import { UsersListingsReadDomain } from "./usersListingsDomain";

const listingsQuerySchema = z.object({
  limit: z.coerce.number().int(),
  offset: z.coerce.number().int(),
});

const userIdSchema = z.string();

export const UsersListingsReadRouter = (
  userListingsReadDomain: UsersListingsReadDomain,
  usersDomain: UsersDomain,
) => {
  const router = Router();

  router.get("/all", async (req, res) => {
    const { limit, offset } = await listingsQuerySchema.parse(req.query);
    const authenticationProviderId = await userIdSchema.parse(
      req?.auth?.payload?.sub,
    );
    const user = await usersDomain.getUserByAuthenticationId(
      authenticationProviderId,
    );

    const data = await userListingsReadDomain.getAll(
      user.userId,
      limit,
      offset,
    );
    res.status(200).send(data);
  });

  router.get("/active", async (req, res) => {
    const authenticationProviderId = await userIdSchema.parse(
      req?.auth?.payload?.sub,
    );
    const user = await usersDomain.getUserByAuthenticationId(
      authenticationProviderId,
    );
    const { limit, offset } = await listingsQuerySchema.parse(req.query);
    const data = await userListingsReadDomain.getActive(
      user.userId,
      limit,
      offset,
    );
    res.status(200).send(data);
  });

  router.get("/sold", async (req, res) => {
    const authenticationProviderId = await userIdSchema.parse(
      req?.auth?.payload?.sub,
    );
    const user = await usersDomain.getUserByAuthenticationId(
      authenticationProviderId,
    );
    const { limit, offset } = await listingsQuerySchema.parse(req.query);
    const data = await userListingsReadDomain.getSold(
      user.userId,
      limit,
      offset,
    );
    res.status(200).send(data);
  });

  router.get("/purchased", async (req, res) => {
    const authenticationProviderId = await userIdSchema.parse(
      req?.auth?.payload?.sub,
    );
    const user = await usersDomain.getUserByAuthenticationId(
      authenticationProviderId,
    );
    const { limit, offset } = await listingsQuerySchema.parse(req.query);
    const data = await userListingsReadDomain.getPurchased(
      user.userId,
      limit,
      offset,
    );
    res.status(200).send(data);
  });

  router.get("/archived", async (req, res) => {
    const authenticationProviderId = await userIdSchema.parse(
      req?.auth?.payload?.sub,
    );

    const user = await usersDomain.getUserByAuthenticationId(
      authenticationProviderId,
    );
    const { limit, offset } = await listingsQuerySchema.parse(req.query);
    const data = await userListingsReadDomain.getArchived(
      user.userId,
      limit,
      offset,
    );
    res.status(200).send(data);
  });

  return router;
};
