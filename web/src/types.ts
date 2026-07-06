export type CheckStatus = "pass" | "fail" | "warn" | "skip";

export interface CheckResult {
  id: string;
  status: CheckStatus;
  message: string;
  details?: string;
}

export interface ConformanceVector {
  id: string;
  title: string;
  category: string;
  priority: string;
  staticCoverage: "full" | "partial" | "none";
  missingChecks: string[];
  description?: string;
  static_checks?: string[];
}

export interface ConformanceReport {
  target: string;
  mode: "abi" | "program" | "vectors";
  spec: string;
  passed: boolean;
  summary: {
    pass: number;
    fail: number;
    warn: number;
    skip: number;
  };
  checks: CheckResult[];
  vectors?: ConformanceVector[];
  checkedAt?: string;
}

export interface SpecFunction {
  name: string;
  category: string;
  inputs?: unknown[];
  outputs?: unknown[];
}

export interface SpecView {
  name: string;
  output?: string;
}

export interface Iarc20Spec {
  arc: number;
  interface: string;
  status: string;
  spec_url?: string;
  discussion_url?: string;
  record?: {
    name: string;
    required_fields: Array<{ name: string; type: string }>;
  };
  functions: SpecFunction[];
  views: SpecView[];
  design_rules?: Array<{ id: string; title: string; description: string }>;
}

export interface RawConformanceVector {
  id: string;
  title: string;
  category: string;
  priority: string;
  description?: string;
  static_checks?: string[];
}

export interface SpecPayload {
  spec: Iarc20Spec;
  vectors: RawConformanceVector[];
}
