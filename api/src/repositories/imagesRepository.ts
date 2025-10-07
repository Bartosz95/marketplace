import {
  PutObjectCommand,
  ListObjectsV2Command,
  S3Client,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { UUID } from "crypto";
import path from "path";
import { FileDetails } from "../listings-api/listingsWriteRouter";
import sharp from "sharp";
import { EnvAWS } from "../libs/validationSchemas";

export interface ImagesRepository {
  uploadImages(listingId: UUID, images: FileDetails[]): Promise<string[]>;
  deleteImages(listingId: UUID): Promise<void>;
  imagesUrl: string
}

export const ImagesRepository = (env: EnvAWS) => {
  const bucket = new S3Client({
    credentials: {
      accessKeyId: env.bucket.accessKey,
      secretAccessKey: env.bucket.secretAccessKey,
    },
    region: env.bucket.region,
  });

  const imagesUrl = env.bucket.url;

  const Bucket = env.bucket.name;
  const uploadImages = async (listingId: UUID, images: FileDetails[]) => {
    const imagesUrls: string[] = [];
    for (const image of images) {
      const Key = path.join("images", listingId, image.originalname);
      const Body = await sharp(image.buffer).resize({height: 689, width: 689, fit: "contain"}).toBuffer()
      const params = {
        Bucket,
        Key,
        Body,
        ContentType: image.mimetype,
      };
      const command = new PutObjectCommand(params);
      await bucket.send(command);
      imagesUrls.push(Key);
    }
    return imagesUrls.map(imageUrl => `${imagesUrl}/${imageUrl}`);
  };

  const deleteImages = async (listingId: UUID) => {
    const Key = path.join("images", listingId);

    const listCommand = new ListObjectsV2Command({
      Bucket,
      Prefix: Key.endsWith("/") ? Key : Key + "/",
    });
    const listedObjects = await bucket.send(listCommand);
    if (listedObjects.Contents && listedObjects.Contents.length !== 0) {
      const deleteCommand = new DeleteObjectsCommand({
        Bucket,
        Delete: {
          Objects: listedObjects.Contents.map((obj) => ({ Key: obj.Key! })),
        },
      });
      await bucket.send(deleteCommand);
    }
  };
  return {
    uploadImages,
    deleteImages,
    imagesUrl
  };
};
