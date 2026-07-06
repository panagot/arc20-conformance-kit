import type { ConformanceReport } from "../types.js";

function statusSymbol(status: string): string {
  switch (status) {
    case "pass":
      return "PASS";
    case "fail":
      return "FAIL";
    case "warn":
      return "WARN";
    default:
      return "SKIP";
  }
}

export function formatTextReport(report: ConformanceReport): string {
  const lines: string[] = [];
  lines.push(`ARC-20 conformance report — ${report.target}`);
  lines.push(`Mode: ${report.mode} · Spec: ${report.spec}`);
  lines.push(
    `Summary: ${report.summary.pass} pass, ${report.summary.fail} fail, ${report.summary.warn} warn`,
  );
  lines.push("");
  lines.push("Checks:");
  for (const check of report.checks) {
    const detail = check.details ? ` (${check.details})` : "";
    lines.push(`  [${statusSymbol(check.status)}] ${check.message}${detail}`);
  }

  if (report.vectors?.length) {
    lines.push("");
    lines.push("Behavioral vectors (static coverage):");
    for (const vector of report.vectors) {
      const missing =
        vector.missingChecks.length > 0
          ? ` · missing: ${vector.missingChecks.join(", ")}`
          : "";
      lines.push(
        `  ${vector.id} ${vector.title} — ${vector.staticCoverage}${missing}`,
      );
    }
  }

  lines.push("");
  lines.push(report.passed ? "RESULT: PASS" : "RESULT: FAIL");
  return lines.join("\n");
}

export function formatJsonReport(report: ConformanceReport): string {
  return JSON.stringify(report, null, 2);
}
