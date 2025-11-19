import {
  Registry,
  collectDefaultMetrics,
  Counter,
  Histogram,
  Gauge,
} from "prom-client";
import express, { Request, Response } from "express";
import { Logger } from "winston";

export const IterationMetrics = (processName: string, logger: Logger) => {
  const register = new Registry();
  collectDefaultMetrics({ register });

  const startMetricsServer = (port = 4001) => {
    const app = express();

    app.get("/metrics", async (req: Request, res: Response) => {
      try {
        res.set("Content-Type", register.contentType);
        res.end(await register.metrics());
      } catch (err) {
        logger.error("Error while fetching metrics", { error: err });
        res.status(500).send();
      }
    });
    app.listen(port, () => {
      logger.debug(`Metrics server listening on port ${port}`);
    });
  };

  const eventsProcessed = new Counter({
    name: "events_processed_total",
    help: "Total number of events processed",
    labelNames: ["process_name", "event_type"],
    registers: [register],
  });
  eventsProcessed.labels({ process_name: processName });
  register.registerMetric(eventsProcessed);

  const bookmartDepth = new Gauge({
    name: "bookmark_depth",
    help: "Depth of the bookmark during iteration",
    labelNames: ["process_name"],
    registers: [register],
  });

  bookmartDepth.labels({ process_name: processName });
  register.registerMetric(bookmartDepth);

  const eventDuration = new Histogram({
    name: "event_processing_duration_seconds",
    help: "Duration to process a single event",
    labelNames: ["process_name"],
    buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2],
    registers: [register],
  });

  eventDuration.labels({ process_name: processName });
  register.registerMetric(eventDuration);

  return {
    startMetricsServer,
    eventsProcessed,
    bookmartDepth,
    eventDuration,
  };
};
