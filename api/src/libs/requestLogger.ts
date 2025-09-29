import { Request, Response, NextFunction } from "express";
import { Logger } from "winston";

export const RequestLogger =
  (logger: Logger) =>
  (req: Request, _: Response, next: NextFunction) => {
    logger.debug("----- Request -----");
    logger.debug(req.method);
    logger.debug(req.path);
    logger.debug("params:");
    logger.debug(JSON.stringify(req.params));
    logger.debug("query:");
    logger.debug(JSON.stringify(req.query));
    logger.debug(`body:`);
    logger.debug(JSON.stringify(req.body));
    next();
  };
