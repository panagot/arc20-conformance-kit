import { readFileSync } from "node:fs";

import { loadConformanceVectors, loadIarc20Spec } from "../spec/load-spec.js";
import type {
  CheckResult,
  ConformanceReport,
  ConformanceVector,
  LeoAbi,
} from "../types.js";
import {
  summarizeChecks,
  validateAbiAgainstSpec,
} from "./abi-validator.js";
import { validateProgramSource } from "./program-source-validator.js";
import { fetchProgramSource } from "./provable-client.js";

export interface RunCheckOptions {
  abiPath?: string;
  abi?: LeoAbi;
  programId?: string;
  network?: "mainnet" | "testnet";
  includeVectors?: boolean;
  json?: boolean;
}

function loadAbi(path: string): LeoAbi {
  return JSON.parse(readFileSync(path, "utf8")) as LeoAbi;
}

function attachVectorCoverage(
  checks: CheckResult[],
  vectors: ConformanceVector[],
): ConformanceVector[] {
  const present = new Set(
    checks
      .filter((check) => check.status === "pass")
      .flatMap((check) => {
        const [, name] = check.id.split(":");
        return name ? [name] : [];
      }),
  );

  return vectors.map((vector) => {
    const missing = vector.missingChecks.filter((name) => !present.has(name));
    const staticCoverage =
      missing.length === 0
        ? "full"
        : missing.length < vector.missingChecks.length
          ? "partial"
          : "none";

    return {
      ...vector,
      staticCoverage,
      missingChecks: missing,
    };
  });
}

function buildReport(
  target: string,
  mode: ConformanceReport["mode"],
  checks: CheckResult[],
  vectors?: ConformanceVector[],
): ConformanceReport {
  const summary = summarizeChecks(checks);
  return {
    target,
    mode,
    spec: "IARC20 (ARC-20)",
    passed: summary.fail === 0,
    summary,
    checks,
    vectors,
  };
}

export async function runConformanceCheck(
  options: RunCheckOptions,
): Promise<ConformanceReport> {
  const spec = loadIarc20Spec();
  const vectors = options.includeVectors ? loadConformanceVectors() : undefined;
  let checks: CheckResult[] = [];
  let target = "unknown";
  let mode: ConformanceReport["mode"] = "abi";

  if (options.abi) {
    const abi = options.abi;
    target = abi.program;
    mode = "abi";
    checks = validateAbiAgainstSpec(abi, spec);
  } else if (options.abiPath) {
    const abi = loadAbi(options.abiPath);
    target = abi.program;
    mode = "abi";
    checks = validateAbiAgainstSpec(abi, spec);
  } else if (options.programId) {
    const network = options.network ?? "testnet";
    target = options.programId.endsWith(".aleo")
      ? options.programId
      : `${options.programId}.aleo`;
    mode = "program";
    const { source } = await fetchProgramSource(target, network);
    checks = validateProgramSource(source, spec, target);
  } else {
    throw new Error("Provide --abi <path> or --program <id>");
  }

  const enrichedVectors = vectors
    ? attachVectorCoverage(checks, vectors)
    : undefined;

  return buildReport(target, mode, checks, enrichedVectors);
}
