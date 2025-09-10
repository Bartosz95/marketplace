import { Router } from "express";
import z from "zod";

const ItemParams = z.string().min(1);

const router = Router();

router.get("/item/:itemID", (req, res) => {
  const itemID = ItemParams.parse(req.params.itemID);
  res.status(200).send(`You view item ID: ${itemID}`);
});

router.post("/item/:itemID", (req, res) => {
  const itemID = ItemParams.parse(req.params.itemID);
  res.status(200).send(`You purchase item ID: ${itemID}`);
});

export default router;