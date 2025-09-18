import express, { Router, urlencoded } from "express";
import { UUID } from "crypto";
import z from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

const listingIdSchema = z.uuid();

export const imagesRouter = () => {
  const router = Router();

  router.use(urlencoded({ limit: "50mb", extended: true }));

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const listingId = listingIdSchema.parse(req.params.listingId);
      const uploadPath = path.join(__dirname, "uploads", listingId); // Example dynamic path
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  const upload = multer({ storage });

  router.post("/:listingId", upload.array("images", 10), async (req, res) => {
    // const images = req.body.images;
    // await imagesRepository.saveImages(listingId, images);
    res.status(200).send();
  });

  router.use("/", express.static(path.join(__dirname, "uploads")));

  return router;
};
