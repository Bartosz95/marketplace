import { Router } from "express";
import z from "zod";
import { UUID } from "crypto";
import { ListingsDomain } from "./listingsDomain";
import { EventType } from "../types";

export const listingIdSchema = z.uuid();
const userIdSchema = z.string();

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
  status: z.enum(EventType).optional(),
});

export type CreateListingReqBody = z.infer<typeof createListingReqBodySchema>;

export type UpdateListingReqBody = z.infer<typeof updateListingReqBodySchema>;

export const ListingsWriteRouter = (listingsDomain: ListingsDomain) => {
  const router = Router();

  router.post("/", async (req, res) => {
    const userId = await userIdSchema.parse(req?.auth?.payload?.sub);
    const data = await createListingReqBodySchema.parse(req.body);
    const listingId = await listingsDomain.create(userId, data);
    res.status(200).send({ listingId: listingId });
  });

  router.post("/:listingId", async (req, res) => {
    console.log(req.params.listingId);
    const userId = await userIdSchema.parse(req?.auth?.payload?.sub);
    const listingId = (await listingIdSchema.parse(
      req.params.listingId
    )) as UUID;

    await listingsDomain.purchase(userId, listingId);
    res.status(200).send();
  });

  router.patch("/:listingId", async (req, res) => {
    const userId = await userIdSchema.parse(req?.auth?.payload?.sub);
    const listingId = (await listingIdSchema.parse(
      req.params.listingId
    )) as UUID;
    const data = await updateListingReqBodySchema.parse(req.body);
    await listingsDomain.update(userId, listingId, data);
    res.status(200).send();
  });

  router.delete("/:listingId", async (req, res) => {
    const userId = await userIdSchema.parse(req?.auth?.payload?.sub);
    const listingId = (await listingIdSchema.parse(
      req.params.listingId
    )) as UUID;
    await listingsDomain.deleteListing(userId, listingId);
    res.status(200).send();
  });

  router.patch("/archive/:listingId", async (req, res) => {
    const userId = await userIdSchema.parse(req?.auth?.payload?.sub);
    const listingId = (await listingIdSchema.parse(
      req.params.listingId
    )) as UUID;
    await listingsDomain.archive(userId, listingId);
    res.status(200).send();
  });

  router.patch("/restore/:listingId", async (req, res) => {
    const userId = await userIdSchema.parse(req?.auth?.payload?.sub);
    const listingId = (await listingIdSchema.parse(
      req.params.listingId
    )) as UUID;
    await listingsDomain.restore(userId, listingId);
    res.status(200).send();
  });

  return router;
};
