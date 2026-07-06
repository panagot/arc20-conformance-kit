import type {
  AbiFunction,
  AbiInput,
  AbiOutput,
  AbiPlaintext,
  AbiRecord,
  AbiRecordRef,
  AbiType,
  CheckResult,
  Iarc20Spec,
  LeoAbi,
  LeoType,
  SpecFunction,
  SpecInput,
  VisibilityMode,
} from "../types.js";

function isPlaintext(input: AbiInput): input is AbiPlaintext {
  return "Plaintext" in input;
}

function isPlaintextOutput(output: AbiOutput): output is AbiPlaintext {
  return typeof output === "object" && output !== null && "Plaintext" in output;
}

function isRecordRef(value: AbiInput | AbiOutput): value is AbiRecordRef {
  return typeof value === "object" && value !== null && "Record" in value;
}

function abiTypeLabel(type: AbiType): LeoType | null {
  if ("Primitive" in type) {
    const primitive = type.Primitive;
    if (primitive === "Address") return "Address";
    if (typeof primitive === "object" && "UInt" in primitive) {
      if (primitive.UInt === "U128") return "U128";
      if (primitive.UInt === "U8") return "U8";
    }
  }
  return null;
}

function recordName(record: AbiRecordRef, programId: string): string | null {
  const path = record.Record.path;
  if (path.length === 0) return null;
  if (record.Record.program !== programId) return null;
  return path[path.length - 1] ?? null;
}

function inputShape(input: SpecInput, abiInput: AbiInput, programId: string): boolean {
  if (input.type === "Token") {
    return isRecordRef(abiInput) && recordName(abiInput, programId) === "Token";
  }

  if (!isPlaintext(abiInput)) return false;
  if (input.mode && abiInput.Plaintext.mode !== input.mode) return false;
  return abiTypeLabel(abiInput.Plaintext.ty) === input.type;
}

function outputShape(expected: LeoType, abiOutput: AbiOutput, programId: string): boolean {
  if (expected === "Final") return abiOutput === "Final";
  if (expected === "Token") {
    return isRecordRef(abiOutput) && recordName(abiOutput, programId) === "Token";
  }

  if (!isPlaintextOutput(abiOutput)) return false;
  return abiTypeLabel(abiOutput.Plaintext.ty) === expected;
}

function compareFunctionSignature(
  specFn: SpecFunction,
  abiFn: AbiFunction | undefined,
  programId: string,
): CheckResult {
  const id = `fn:${specFn.name}`;

  if (!abiFn) {
    return {
      id,
      status: "fail",
      message: `Missing required function ${specFn.name}`,
    };
  }

  if (abiFn.inputs.length !== specFn.inputs.length) {
    return {
      id,
      status: "fail",
      message: `${specFn.name} input arity mismatch`,
      details: `Expected ${specFn.inputs.length}, got ${abiFn.inputs.length}`,
    };
  }

  for (let i = 0; i < specFn.inputs.length; i += 1) {
    if (!inputShape(specFn.inputs[i], abiFn.inputs[i], programId)) {
      return {
        id,
        status: "fail",
        message: `${specFn.name} input #${i + 1} shape mismatch`,
        details: `Expected ${JSON.stringify(specFn.inputs[i])}`,
      };
    }
  }

  if (abiFn.outputs.length !== specFn.outputs.length) {
    return {
      id,
      status: "fail",
      message: `${specFn.name} output arity mismatch`,
      details: `Expected ${specFn.outputs.length}, got ${abiFn.outputs.length}`,
    };
  }

  for (let i = 0; i < specFn.outputs.length; i += 1) {
    if (!outputShape(specFn.outputs[i], abiFn.outputs[i], programId)) {
      return {
        id,
        status: "fail",
        message: `${specFn.name} output #${i + 1} shape mismatch`,
        details: `Expected ${specFn.outputs[i]}`,
      };
    }
  }

  return {
    id,
    status: "pass",
    message: `${specFn.name} signature matches IARC20`,
  };
}

function validateTokenRecord(
  records: AbiRecord[] | undefined,
  spec: Iarc20Spec,
): CheckResult {
  const id = "record:Token";
  const token = records?.find((record) => record.path.includes(spec.record.name));

  if (!token) {
    return {
      id,
      status: "fail",
      message: `Missing required record ${spec.record.name}`,
    };
  }

  for (const required of spec.record.required_fields) {
    const field = token.fields.find((entry) => entry.name === required.name);
    if (!field) {
      return {
        id,
        status: "fail",
        message: `Token record missing field ${required.name}`,
      };
    }

    const label = abiTypeLabel(field.ty);
    if (required.type === "U128" && label !== "U128") {
      return {
        id,
        status: "fail",
        message: `Token.${required.name} must be u128`,
        details: `Found ${JSON.stringify(field.ty)}`,
      };
    }
    if (required.type === "Address" && label !== "Address") {
      return {
        id,
        status: "fail",
        message: `Token.${required.name} must be address`,
      };
    }
  }

  return {
    id,
    status: "pass",
    message: "Token record includes owner and amount",
  };
}

function validateView(
  name: string,
  views: AbiFunction[] | undefined,
  functions: AbiFunction[] | undefined,
): CheckResult {
  const id = `view:${name}`;
  const found = views?.find((entry) => entry.name === name)
    ?? functions?.find((entry) => entry.name === name);

  if (!found) {
    return {
      id,
      status: "fail",
      message: `Missing required view fn ${name}`,
    };
  }

  return {
    id,
    status: "pass",
    message: `${name} view fn present`,
  };
}

export function validateAbiAgainstSpec(
  abi: LeoAbi,
  spec: Iarc20Spec,
): CheckResult[] {
  const programId = abi.program;
  const checks: CheckResult[] = [];

  checks.push({
    id: "meta:program",
    status: programId.endsWith(".aleo") ? "pass" : "warn",
    message: programId.endsWith(".aleo")
      ? `Program id ${programId}`
      : `Program id ${programId} should end with .aleo`,
  });

  checks.push(validateTokenRecord(abi.records, spec));

  for (const specFn of spec.functions) {
    const abiFn = abi.functions?.find((entry) => entry.name === specFn.name);
    checks.push(compareFunctionSignature(specFn, abiFn, programId));
  }

  for (const view of spec.views) {
    checks.push(validateView(view.name, abi.views, abi.functions));
  }

  return checks;
}

export function summarizeChecks(checks: CheckResult[]): {
  pass: number;
  fail: number;
  warn: number;
  skip: number;
} {
  return checks.reduce(
    (acc, check) => {
      acc[check.status] += 1;
      return acc;
    },
    { pass: 0, fail: 0, warn: 0, skip: 0 },
  );
}
