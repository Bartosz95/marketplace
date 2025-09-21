import winston from "winston";

export const Logger = (level: string) => {
  const logger = winston.createLogger({
    level,
    format: winston.format.simple(),
    transports: [
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
    ],
  });

  return logger;
};
