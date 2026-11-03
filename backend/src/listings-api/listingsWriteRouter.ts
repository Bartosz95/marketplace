import { Router, urlencoded } from "express";
import z from "zod";
import { UUID } from "crypto";
import { ListingsDomain } from "./listingsDomain";
import multer from "multer";
import { userIdSchema, listingIdSchema } from "../libs/validationSchemas";
import { UsersDomain } from "../users-api/usersDomain";
import { ListingStatus } from "../types";

const fileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  size: z.number().positive(),
  buffer: z.instanceof(Buffer).optional(),
});

export type FileDetails = z.infer<typeof fileSchema>;

const createListingReqBodySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(0),
  price: z.coerce.number().min(0),
  images: z.array(fileSchema),
});

const updateListingReqBodySchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(0).optional(),
  price: z.coerce.number().min(0).optional(),
  images: z.array(fileSchema).optional(),
  status: z.enum(ListingStatus).optional(),
});

export type CreateListing = {
  title: string;
  price: number;
  description: string;
  images: FileDetails[];
};

export type UpdateListing = {
  title?: string;
  price?: number;
  description?: string;
  images?: FileDetails[];
  status?: ListingStatus;
};

export const ListingsWriteRouter = (
  listingsDomain: ListingsDomain,
  userDomain: UsersDomain,
) => {
  const router = Router();

  router.use(urlencoded({ limit: "50mb", extended: true }));

  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });

  router.post("/", upload.array("images", 10), async (req, res) => {
    const authenticationProviderId = userIdSchema.parse(
      req?.auth?.payload?.sub,
    );
    const data = createListingReqBodySchema.parse({
      ...req.body,
      images: req.files as Express.Multer.File[],
    });
    const user = await userDomain.getUserByAuthenticationId(
      authenticationProviderId,
    );
    await listingsDomain.create(user.userId, data);
    res.sendStatus(204);
  });

  router.patch("/:listingId", upload.array("images", 10), async (req, res) => {
    const authenticationProviderId = userIdSchema.parse(
      req?.auth?.payload?.sub,
    );
    const listingId = listingIdSchema.parse(req.params.listingId) as UUID;
    const user = await userDomain.getUserByAuthenticationId(
      authenticationProviderId,
    );
    const files = req.files as Express.Multer.File[];
    const images = files.length > 0 ? files : undefined;
    const data = updateListingReqBodySchema.parse({
      ...req.body,
      images,
    });
    await listingsDomain.update(user.userId, listingId, data);
    res.sendStatus(204);
  });

  router.delete("/:listingId", async (req, res) => {
    const authenticationProviderId = userIdSchema.parse(
      req?.auth?.payload?.sub,
    );
    const listingId = listingIdSchema.parse(req.params.listingId) as UUID;
    const user = await userDomain.getUserByAuthenticationId(
      authenticationProviderId,
    );
    await listingsDomain.deleteListing(user.userId, listingId);
    res.sendStatus(204);
  });

  return router;
};
