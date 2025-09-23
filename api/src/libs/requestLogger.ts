import { Request, Response, NextFunction } from "express";
import { Logger } from "winston";

export const RequestLogger =
  (logger: Logger) => (req: Request, res: Response, next: NextFunction) => {
    logger.info("----- Request -----");
    logger.info(req.method);
    logger.info(req.path);
    logger.info("params:");
    logger.info(JSON.stringify(req.params));
    logger.info(`body:`);
    console.log(req.body);
    next();
  };
