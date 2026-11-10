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
      logger.info(`Metrics server listening on port ${port}`);
    });
  };

  const eventsProcessed = new Counter({
    name: "events_processed_total",
    help: "Total number of events processed",
    labelNames: ["process_name", "event_type"],
    registers: [register],
  });

  const bookmarkDepth = new Gauge({
    name: "bookmark_depth",
    help: "Difference between the latest event position and the worker bookmark position",
    labelNames: ["process_name"],
    registers: [register],
  });

  const bookmarkPosition = new Gauge({
    name: "event_bookmark_position",
    help: "Latest event position successfully processed by the worker",
    labelNames: ["process_name"],
    registers: [register],
  });

  const latestEventPosition = new Gauge({
    name: "event_store_latest_position",
    help: "Highest event position currently present in the event store",
    labelNames: ["process_name"],
    registers: [register],
  });

  const eventDuration = new Histogram({
    name: "event_processing_duration_seconds",
    help: "Duration to process a single event",
    labelNames: ["process_name"],
    buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2],
    registers: [register],
  });

  const paymentReconciliationChecks = new Counter({
    name: "payment_reconciliation_checks_total",
    help: "Checkout sessions checked by the payment reconciliation worker",
    labelNames: ["process_name", "result"],
    registers: [register],
  });

  return {
    processName,
    startMetricsServer,
    eventsProcessed,
    bookmarkDepth,
    bookmarkPosition,
    latestEventPosition,
    eventDuration,
    paymentReconciliationChecks,
  };
};
