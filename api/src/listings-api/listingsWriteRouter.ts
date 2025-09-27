import { Router, urlencoded } from "express";
import z from "zod";
import { UUID } from "crypto";
import { ListingsDomain } from "./listingsDomain";
import multer from "multer";
export const listingIdSchema = z.uuid();
const userIdSchema = z.string();

const createListingReqBodySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(0),
  price: z.coerce.number().min(0),
});

const updateListingReqBodySchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(0).optional(),
  price: z.coerce.number().min(0).optional(),
});

export type CreateListing = {
  title: string;
  price: number;
  description: string;
  images: Express.Multer.File[];
};

export type UpdateListingReqBody = z.infer<typeof updateListingReqBodySchema>;

export const ListingsWriteRouter = (
  listingsDomain: ListingsDomain,
  env: any
) => {
  const router = Router();

  router.use(urlencoded({ limit: "50mb", extended: true }));

  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });

  router.post("/", upload.array("images", 10), async (req, res) => {
    const userId = await userIdSchema.parse(req?.auth?.payload?.sub);
    const details = await createListingReqBodySchema.parse(
      JSON.parse(req.body.details)
    );
    const images = req.files as Express.Multer.File[];
    const data: CreateListing = {
      title: details.title,
      price: details.price,
      description: details.description,
      images: images,
    };
    await listingsDomain.create(userId, data);
    res.status(200).send();
  });

  router.post("/:listingId", async (req, res) => {
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
