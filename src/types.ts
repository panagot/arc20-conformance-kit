export type LeoType =
  | "Address"
  | "U128"
  | "U8"
  | "Identifier"
  | "Token"
  | "Final";

export type VisibilityMode = "Public" | "Private";

export interface SpecInput {
  name: string;
  mode?: VisibilityMode;
  type: LeoType;
}

export interface SpecFunction {
  name: string;
  category: string;
  inputs: SpecInput[];
  outputs: LeoType[];
}

export interface SpecView {
  name: string;
  inputs: Array<{ name: string; type: LeoType }>;
  output: LeoType;
}

export interface Iarc20Spec {
  arc: number;
  interface: string;
  status: string;
  spec_url: string;
  discussion_url: string;
  record: {
    name: string;
    required_fields: Array<{ name: string; type: LeoType }>;
  };
  functions: SpecFunction[];
  views: SpecView[];
  design_rules: Array<{ id: string; title: string; description: string }>;
}

export interface AbiPlaintext {
  Plaintext: {
    ty: AbiType;
    mode: VisibilityMode;
  };
}

export interface AbiRecordRef {
  Record: {
    path: string[];
    program: string;
  };
}

export type AbiInput = AbiPlaintext | AbiRecordRef;

export type AbiOutput = "Final" | AbiPlaintext | AbiRecordRef;

export interface AbiFunction {
  name: string;
  inputs: AbiInput[];
  outputs: AbiOutput[];
}

export interface AbiRecordField {
  name: string;
  ty: AbiType;
  mode: VisibilityMode;
}

export interface AbiRecord {
  path: string[];
  fields: AbiRecordField[];
}

export interface LeoAbi {
  program: string;
  records?: AbiRecord[];
  functions?: AbiFunction[];
  views?: AbiFunction[];
}

export type AbiType =
  | { Primitive: "Address" }
  | { Primitive: { UInt: "U128" } }
  | { Primitive: { UInt: "U8" } }
  | { Primitive: { UInt: "U64" } }
  | { Primitive: "Boolean" }
  | { Primitive: "Field" }
  | { Primitive: { Int: string } }
  | { Primitive: { UInt: string } }
  | { Struct: { path: string[]; program: string } }
  | { Array: { element: AbiType; length: number } }
  | { Optional: AbiType };

export type CheckStatus = "pass" | "fail" | "warn" | "skip";

export interface CheckResult {
  id: string;
  status: CheckStatus;
  message: string;
  details?: string;
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
}

export interface ConformanceVector {
  id: string;
  title: string;
  category: string;
  priority: string;
  staticCoverage: "full" | "partial" | "none";
  missingChecks: string[];
}

export interface ProvableProgramResponse {
  program?: string;
  source?: string;
  edition?: number;
}
