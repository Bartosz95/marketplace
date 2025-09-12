import winston from 'winston';

export const Logger = (level: string) => {

  const logger = winston.createLogger({
    level,
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
  });

  if (process.env.NODE_ENV !== 'listingion') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple(),
    }));
  }

  return logger;

}