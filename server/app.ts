import cors from "cors";
import express from "express";

import { loadDemoAbi, loadRawConformanceVectors, loadIarc20Spec } from "../src/spec/load-spec.js";
import { runConformanceCheck } from "../src/validate/run-check.js";
import type { LeoAbi } from "../src/types.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "arc20-conformance-kit" });
  });

  app.get("/api/spec", (_req, res) => {
    res.json({
      spec: loadIarc20Spec(),
      vectors: loadRawConformanceVectors(),
    });
  });

  app.get("/api/demo/abi", (_req, res) => {
    res.json(loadDemoAbi());
  });

  app.get("/api/demo", async (_req, res, next) => {
    try {
      const report = await runConformanceCheck({
        abi: loadDemoAbi(),
        includeVectors: true,
      });
      res.json(report);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/check/abi", async (req, res, next) => {
    try {
      const abi = req.body?.abi as LeoAbi | undefined;
      if (!abi?.program) {
        res.status(400).json({ error: "Request body must include abi.program" });
        return;
      }
      const report = await runConformanceCheck({
        abi,
        includeVectors: Boolean(req.body?.includeVectors ?? true),
      });
      res.json(report);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/check/program", async (req, res, next) => {
    try {
      const programId = req.body?.programId as string | undefined;
      if (!programId) {
        res.status(400).json({ error: "programId is required" });
        return;
      }
      const network = req.body?.network === "mainnet" ? "mainnet" : "testnet";
      const report = await runConformanceCheck({
        programId,
        network,
        includeVectors: Boolean(req.body?.includeVectors ?? true),
      });
      res.json(report);
    } catch (error) {
      next(error);
    }
  });

  app.use(
    (_error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      const message = _error instanceof Error ? _error.message : String(_error);
      res.status(500).json({ error: message });
    },
  );

  return app;
}
