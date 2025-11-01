import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { Logger } from "winston";
import { ZodError } from "zod";
// eslint-disable-next-line no-unused-vars
export const ErrorHandler =
  (logger: Logger) =>
  (error: Error, req: Request, res: Response, _: NextFunction) => {
    if (error instanceof multer.MulterError) {
      logger.error("multer error");
    } else if (error instanceof ZodError) {
      logger.error("Handle zod errors");
    }
    logger.error(error);
    console.log(error);
    res.status(500).send();
  };
