import express, { Router, urlencoded } from "express";
import { UUID } from "crypto";
import z from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { EventSourceRepository } from "../repositories/eventSourceRepository";
import { EventType, ImagesUploadedEvent } from "../types";

const listingIdSchema = z.uuid();

export const imagesRouter = (eventSourceRepository: EventSourceRepository) => {
  const router = Router();

  router.use(urlencoded({ limit: "50mb", extended: true }));

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const listingId = listingIdSchema.parse(req.params.listingId);
      const uploadPath = path.join(__dirname, "uploads", listingId);
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  const upload = multer({ storage });

  router.post("/:listingId", upload.array("images", 10), async (req, res) => {
    const listingId = listingIdSchema.parse(req.params.listingId) as UUID;
    const files = req.files as Express.Multer.File[];
    const imagesUrls = files.map((file) =>
      path.join(listingId, file.originalname)
    );
    const event: ImagesUploadedEvent = {
      eventType: EventType.IMAGES_UPLOADED,
      listingId,
      data: { imagesUrls },
      position: 0,
      version: 0,
      createdAt: new Date(),
      metadata: {},
    };
    eventSourceRepository.insertEvent(event);
    res.status(200).send();
  });

  router.use(`/`, express.static(path.join(__dirname, "uploads")));

  return router;
};
