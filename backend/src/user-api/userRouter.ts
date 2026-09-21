import { Router } from "express";
import z from "zod";
import { UUID } from "crypto";
import { UserDomain } from "./userDomain";

const userQuerySchema = z.object({
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
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

  router.get("/", async (req, res) => {
    const authenticationProviderId = userIdSchema.parse(
      req?.auth?.payload?.sub,
    ) as UUID;
    const user = await userDomain.getUserByAuthenticationId(
      authenticationProviderId,
    );
    const responseBody = {
      userId: user?.userId,
      name: user?.name,
      email: user?.email,
      address: user?.address,
    };
    res.status(200).send(responseBody);
  });

  return router;
};
