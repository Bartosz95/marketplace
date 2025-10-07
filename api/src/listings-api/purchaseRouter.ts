import { Router } from "express";
import { ListingsDomain } from "./domain/listingsDomain";
import { UUID } from "crypto";
import { userIdSchema, listingIdSchema } from "../libs/validationSchemas";


export const PurchaseRouter = (
  listingsDomain: ListingsDomain,
  env: any
) => {
  const router = Router();

    router.get("/config", (req, res) => {
      res.send({
        publishableKey: env.publishableKey
      })
    })
    router.post("/:listingId", async (req, res) => {
      const userId = await userIdSchema.parse(req?.auth?.payload?.sub);
      const listingId = (await listingIdSchema.parse(
        req.params.listingId
      )) as UUID;
      await listingsDomain.purchase(userId, listingId);
      res.status(200).send();
    });
    return router
}