import type { ConformanceReport, CheckResult } from "../types";

export function scorePercent(report: ConformanceReport): number {
  const total =
    report.summary.pass +
    report.summary.fail +
    report.summary.warn +
    report.summary.skip;
  if (total === 0) return 0;
  return Math.round((report.summary.pass / total) * 100);
}

export function vectorCoveragePercent(report: ConformanceReport): number {
  if (!report.vectors?.length) return 0;
  const full = report.vectors.filter((v) => v.staticCoverage === "full").length;
  return Math.round((full / report.vectors.length) * 100);
}

export interface CategoryStat {
  category: string;
  pass: number;
  fail: number;
  warn: number;
  total: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  transfer: "Transfer",
  approval: "Approval",
  record: "Record ops",
  views: "Views",
  meta: "Metadata",
  source: "Source",
  other: "Other",
};

export function categoryLabel(key: string): string {
  return CATEGORY_LABELS[key] ?? key;
}

function checkCategory(check: CheckResult): string {
  if (check.id.startsWith("fn:")) {
    const name = check.id.replace("fn:", "");
    if (name.includes("approve") || name.includes("unapprove")) return "approval";
    if (name === "join" || name === "split") return "record";
    return "transfer";
  }
  if (check.id.startsWith("view:")) return "views";
  if (check.id.startsWith("record:")) return "record";
  if (check.id.startsWith("source:")) return "source";
  if (check.id.startsWith("meta:")) return "meta";
  return "other";
}

export function categoryBreakdown(report: ConformanceReport): CategoryStat[] {
  const map = new Map<string, CategoryStat>();

  for (const check of report.checks) {
    const category = checkCategory(check);
    const entry = map.get(category) ?? {
      category,
      pass: 0,
      fail: 0,
      warn: 0,
      total: 0,
    };
    entry.total += 1;
    if (check.status === "pass") entry.pass += 1;
    else if (check.status === "fail") entry.fail += 1;
    else if (check.status === "warn") entry.warn += 1;
    map.set(category, entry);
  }

  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function copyJson(data: unknown) {
  await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
}
