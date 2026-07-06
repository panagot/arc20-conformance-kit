import iarc20SpecJson from "./data/iarc20.json" with { type: "json" };
import vectorsJson from "./data/iarc20-vectors.json" with { type: "json" };
import demoAbiJson from "./data/demo-abi.json" with { type: "json" };

import type { ConformanceVector, Iarc20Spec, LeoAbi } from "../types.js";

export function loadIarc20Spec(): Iarc20Spec {
  return iarc20SpecJson as Iarc20Spec;
}

export function loadRawConformanceVectors() {
  return vectorsJson as Array<{
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

export function loadDemoAbi(): LeoAbi {
  return demoAbiJson as LeoAbi;
}
