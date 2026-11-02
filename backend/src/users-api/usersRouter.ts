import { Router } from "express";
import z from "zod";
import { UUID } from "crypto";
import { UsersDomain } from "./usersDomain";

const usersQuerySchema = z.object({
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
});

const updateUsersSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  street: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  zipCode: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
});

export const usersIdSchema = z.string();

export const UsersRouter = (userDomain: UsersDomain) => {
  const router = Router();

  router.get("/me", async (req, res) => {
    const authenticationProviderId = usersIdSchema.parse(
      req?.auth?.payload?.sub,
    ) as UUID;
    const user = await userDomain.getUserByAuthenticationId(
      authenticationProviderId,
    );

    const responseBody = {
      userId: user?.userId,
      authenticationProviderId: user?.authenticationProviderId,
      paymentProviderId: user?.paymentProviderId,
      name: user?.name,
      email: user?.email,
      address: user?.address,
      createdAt: user?.createdAt,
      updatedAt: user?.updatedAt,
    };
    res.status(200).send(responseBody);
  });

  return router;
};
