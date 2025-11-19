import express, { Request, Response, NextFunction } from "express";
import client from "prom-client";
import { Logger } from "winston";

export const RequestMetrics = (logger: Logger) => {
  const register = new client.Registry();
  client.collectDefaultMetrics({ register });

  const httpRequestsTotal = new client.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"],
    registers: [register],
  });

  const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5],
    registers: [register],
  });

  const collectRequestMetrics = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const start = process.hrtime();

    res.on("finish", () => {
      const diff = process.hrtime(start);
      const durationInSeconds = diff[0] + diff[1] / 1e9;
      const route = req.route?.path || req.path;

      httpRequestsTotal
        .labels(req.method, route, res.statusCode.toString())
        .inc();
      httpRequestDuration
        .labels(req.method, route, res.statusCode.toString())
        .observe(durationInSeconds);
    });

    next();
  };

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
      console.log(`Metrics server listening on port ${port}`);
    });
  };

  return {
    collectRequestMetrics,
    startMetricsServer,
  };
};
