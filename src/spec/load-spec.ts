import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { ConformanceVector, Iarc20Spec } from "../types.js";

const packageRoot =
  process.env.VERCEL === "1"
    ? process.cwd()
    : join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export function loadIarc20Spec(): Iarc20Spec {
  const path = join(packageRoot, "spec", "iarc20.json");
  return JSON.parse(readFileSync(path, "utf8")) as Iarc20Spec;
}

export function loadRawConformanceVectors() {
  const path = join(packageRoot, "spec", "vectors", "iarc20-vectors.json");
  return JSON.parse(readFileSync(path, "utf8")) as Array<{
    id: string;
    title: string;
    category: string;
    priority: string;
    description?: string;
    static_checks?: string[];
  }>;
}

export function loadConformanceVectors(): ConformanceVector[] {
  return loadRawConformanceVectors().map((vector) => ({
    id: vector.id,
    title: vector.title,
    category: vector.category,
    priority: vector.priority,
    staticCoverage: "none",
    missingChecks: vector.static_checks ?? [],
  }));
}

export function getPackageRoot(): string {
  return packageRoot;
}
