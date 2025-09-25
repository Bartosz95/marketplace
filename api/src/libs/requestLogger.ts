import { Request, Response, NextFunction } from "express";
import { Logger } from "winston";

export const RequestLogger =
  (logger: Logger, NODE_ENV?: string) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (NODE_ENV !== "production") {
      logger.info("----- Request -----");
      logger.info(req.method);
      logger.info(req.path);
      logger.info("params:");
      logger.info(JSON.stringify(req.params));
      logger.info("query:");
      logger.info(JSON.stringify(req.query));
      logger.info(`body:`);
      logger.info(JSON.stringify(req.body));
    }
    next();
  };
