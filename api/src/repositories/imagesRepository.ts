import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { UUID } from "crypto";
import path from "path";

export interface ImagesRepository {
  upload(listingId: UUID, images: Express.Multer.File[]): Promise<string[]>;
}

export const ImagesRepository = (env: any) => {
  const bucket = new S3Client({
    credentials: {
      accessKeyId: env.accessKey,
      secretAccessKey: env.secretAccessKey,
    },
    region: env.region,
  });
  const upload = async (listingId: UUID, images: Express.Multer.File[]) => {
    const imagesUrls: string[] = [];
    for (const image of images) {
      const imageUrl = path.join("images", listingId, image.originalname);
      imagesUrls.push(imageUrl);
      const params = {
        Bucket: env.name,
        Key: imageUrl,
        Body: image.buffer,
        ContentType: image.mimetype,
      };
      const command = new PutObjectCommand(params);
      await bucket.send(command);
    }
    return imagesUrls;
  };
  return {
    upload,
  };
};
