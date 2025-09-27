import {
  PutObjectCommand,
  ListObjectsV2Command,
  S3Client,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { UUID } from "crypto";
import path from "path";
import { FileDetails } from "../listings-api/listingsWriteRouter";

export interface ImagesRepository {
  uploadImages(listingId: UUID, images: FileDetails[]): Promise<string[]>;
  deleteImages(listingId: UUID): Promise<void>;
}

export const ImagesRepository = (env: any) => {
  const bucket = new S3Client({
    credentials: {
      accessKeyId: env.accessKey,
      secretAccessKey: env.secretAccessKey,
    },
    region: env.region,
  });

  const Bucket = env.name;
  const uploadImages = async (listingId: UUID, images: FileDetails[]) => {
    const imagesUrls: string[] = [];
    for (const image of images) {
      const Key = path.join("images", listingId, image.originalname);
      imagesUrls.push(Key);
      const params = {
        Bucket,
        Key,
        Body: image.buffer,
        ContentType: image.mimetype,
      };
      const command = new PutObjectCommand(params);
      await bucket.send(command);
    }
    return imagesUrls;
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
  };
};
