import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { Logger } from "winston";
import { ZodError } from "zod";

export const ErrorHandler =
  (logger: Logger) =>
  (error: any, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof multer.MulterError) {
      logger.error("multer error");
    } else if (error instanceof ZodError) {
      logger.error("Handle zod errors");
    }
    logger.error(error);
    console.log(error);
    res.status(error.status || 500).send();
  };
