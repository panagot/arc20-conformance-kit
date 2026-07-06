import type { CheckResult, Iarc20Spec } from "../types.js";

const FUNCTION_PATTERN = /\bfn\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
const VIEW_PATTERN = /\bview\s+fn\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
const INTERFACE_PATTERN = /program\s+[a-zA-Z0-9_.-]+\s*:\s*IARC20\b/;

export function validateProgramSource(
  source: string,
  spec: Iarc20Spec,
  programId?: string,
): CheckResult[] {
  const checks: CheckResult[] = [];
  const functionNames = new Set<string>();
  const viewNames = new Set<string>();

  for (const match of source.matchAll(FUNCTION_PATTERN)) {
    if (match[1]) functionNames.add(match[1]);
  }

  for (const match of source.matchAll(VIEW_PATTERN)) {
    if (match[1]) viewNames.add(match[1]);
  }

  if (programId) {
    checks.push({
      id: "source:program-id",
      status: source.includes(programId) ? "pass" : "warn",
      message: source.includes(programId)
        ? `Source references ${programId}`
        : `Source may not match requested program ${programId}`,
    });
  }

  checks.push({
    id: "source:interface",
    status: INTERFACE_PATTERN.test(source) ? "pass" : "warn",
    message: INTERFACE_PATTERN.test(source)
      ? "Program declares : IARC20"
      : "Program source does not declare : IARC20 (recommended for dynamic dispatch)",
  });

  for (const specFn of spec.functions) {
    checks.push({
      id: `source:fn:${specFn.name}`,
      status: functionNames.has(specFn.name) ? "pass" : "fail",
      message: functionNames.has(specFn.name)
        ? `${specFn.name} found in source`
        : `Missing function ${specFn.name} in source`,
    });
  }

  for (const view of spec.views) {
    const present = viewNames.has(view.name) || functionNames.has(view.name);
    checks.push({
      id: `source:view:${view.name}`,
      status: present ? "pass" : "fail",
      message: present
        ? `${view.name} found in source`
        : `Missing view fn ${view.name} in source`,
    });
  }

  if (/record\s+Token\s*\{/.test(source)) {
    checks.push({
      id: "source:record:Token",
      status: /owner\s*:\s*address/.test(source) && /amount\s*:\s*u128/.test(source)
        ? "pass"
        : "warn",
      message: "Token record declaration present",
      details: "Verify owner: address and amount: u128 in Leo source",
    });
  } else {
    checks.push({
      id: "source:record:Token",
      status: "warn",
      message: "Token record declaration not found in source text",
    });
  }

  return checks;
}
