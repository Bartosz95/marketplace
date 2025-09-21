import { Request, Response, NextFunction } from "express";
import { Logger } from "winston";

export const RequestLogger =
  (logger: Logger) => (req: Request, res: Response, next: NextFunction) => {
    logger.info("Request path:");
    console.log(req.path);
    logger.info(JSON.stringify(req.path));
    logger.info("Request params:");
    logger.info(JSON.stringify(req.params));
    logger.info(`Request body:`);
    console.log(req.body);
    next();
  };
