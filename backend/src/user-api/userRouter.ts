import { Router } from "express";
import z from "zod";
import { UUID } from "crypto";
import { UserListingsDomain } from "../listings-api/domain/userListingsDomain";
import { UserDomain } from "../domain/userListingsDomain";

const listingsQuerySchema = z.object({
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
});

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().min(1),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  street: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  zipCode: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
});

export const userIdSchema = z.string();

export const UserRouter = (userDomain: UserDomain) => {
  const router = Router();

  router.post("/", async (req, res) => {
    const userData = await createUserSchema.parse(req.body);
    await userDomain.createUser(
      userData.name,
      userData.email,
      userData.street,
      userData.city,
      userData.state,
      userData.zipCode,
      userData.country
    );
    res.status(201).send();
  });

  router.patch("/", async (req, res) => {
    const userId = (await userIdSchema.parse(req?.auth?.payload?.sub)) as UUID;
    const userData = await updateUserSchema.parse(req.body);
    await userDomain.updateUser(
      userId,
      userData.name,
      userData.email,
      userData.street,
      userData.city,
      userData.state,
      userData.zipCode,
      userData.country
    );
    res.status(200).send();
  });

  router.get("/", async (req, res) => {
    const userId = (await userIdSchema.parse(req?.auth?.payload?.sub)) as UUID;
    const data = await userDomain.getUser(userId);
    res.status(200).send(data);
  });

  return router;
};
