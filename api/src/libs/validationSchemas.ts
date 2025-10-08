import z from "zod";

export const listingIdSchema = z.uuid();
export const userIdSchema = z.string();

export const EnvDBSchema = z.object({
  host: z.string(),
  port: z.coerce.number(),
  user: z.string(),
  password: z.string(),
  database: z.string(),
});

export type EnvDB = z.infer<typeof EnvDBSchema>;

export const EnvAWSSchema = z.object({
  bucket: z.object({
    region: z.string(),
    name: z.string(),
    arn: z.string(),
    accessKey: z.string(),
    secretAccessKey: z.string(),
    url: z.string(),
  }),
});

export type EnvAWS = z.infer<typeof EnvAWSSchema>;

export const EnvPurchaseSchema = z.object({
  secretKey: z.string(),
  publishableKey: z.string(),
});

export type EnvPurchase = z.infer<typeof EnvPurchaseSchema>;

export const fileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  size: z.number().positive(),
  buffer: z.instanceof(Buffer).optional(),
});

export type FileDetails = z.infer<typeof fileSchema>;