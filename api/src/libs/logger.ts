import winston from "winston";
import { EnvApp } from "../listings-api/app";

export const Logger = (env: EnvApp) => {
  const logger = winston.createLogger({
    level: env.logLevel,
    format: winston.format.simple(),
    transports: [
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
    ],
  });

  return logger;
};
