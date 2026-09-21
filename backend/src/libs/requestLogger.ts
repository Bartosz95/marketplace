import { Request, Response, NextFunction } from "express";
import { Logger } from "winston";

export const RequestLogger =
  (logger: Logger) => (req: Request, _: Response, next: NextFunction) => {
    logger.debug("----- Request -----");
    logger.debug("method:");
    logger.debug(req.method);
    logger.debug("path:");
    logger.debug(req.path);
    logger.debug("headers.authorization:");
    logger.debug(req.headers.authorization);
    logger.debug("auth:");
    logger.debug(req.auth);
    logger.debug("params:");
    logger.debug(JSON.stringify(req.params));
    logger.debug("query:");
    logger.debug(JSON.stringify(req.query));
    logger.debug(`body:`);
    logger.debug(req.body);
    next();
  };
