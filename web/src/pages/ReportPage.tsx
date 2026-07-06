import { Copy, Download, MoreHorizontal, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

import { checkAbi, checkProgram, fetchDemoReport } from "../api";
import { CategoryBreakdown } from "../components/conformance/CategoryBreakdown";
import { CheckList } from "../components/conformance/CheckList";
import { ConformanceScore } from "../components/conformance/ConformanceScore";
import { VectorHeatmap } from "../components/conformance/VectorHeatmap";
import { PageToolbar, Panel } from "../components/layout/PageToolbar";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorPanel } from "../components/ui/ErrorPanel";
import { LoadingProgress } from "../components/ui/LoadingProgress";
import { CheckSourceBadge, StatusBadge } from "../components/ui/StatusBadge";
import { useReport } from "../context/ReportContext";
import { useToast } from "../context/ToastContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { useShellContext } from "../hooks/useShellContext";
import { useStagedProgress } from "../hooks/useStagedProgress";
import {
  categoryBreakdown,
  copyJson,
  downloadJson,
  scorePercent,
  vectorCoveragePercent,
} from "../lib/conformance-utils";

const refreshSteps = ["Re-running check", "Revalidating interface", "Refreshing vectors"];

function formatCheckedAt(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function ReportPage() {
  usePageTitle("Report");
  const { report, checkMeta, setReport, clearReport } = useReport();
  const { pushToast } = useToast();
  const { apiOnline, apiReady } = useShellContext();
  const checksDisabled = !apiReady || (apiReady && !apiOnline);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [mobileActions, setMobileActions] = useState(false);
  const progress = useStagedProgress(refreshSteps);

  async function rerunCheck() {
    if (checksDisabled) return;
    if (!checkMeta) {
      pushToast("No check metadata — run demo or a new check", "error");
      return;
    }
    setError(null);
    progress.start();
    try {
      let next;
      if (checkMeta.kind === "demo") next = await fetchDemoReport();
      else if (checkMeta.kind === "abi") next = await checkAbi(checkMeta.abi);
      else next = await checkProgram(checkMeta.programId, checkMeta.network);
      progress.complete();
      setReport(next, checkMeta);
      pushToast("Report refreshed", "success");
    } catch (err) {
      progress.reset();
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleCopy() {
    if (!report) return;
    await copyJson(report);
    setCopied(true);
    pushToast("Report copied to clipboard", "success");
    window.setTimeout(() => setCopied(false), 2000);
  }

  function handleClear() {
    clearReport();
    setConfirmClear(false);
    pushToast("Report cleared", "info");
  }

  if (!report) {
    return (
      <div>
        <PageToolbar
          eyebrow="Report"
          title="Report Viewer"
          description="No report loaded yet."
        />
        <EmptyState
          title="No conformance report"
          description="Run an ABI check, program check, or demo from the overview to generate a report."
          action={
            <Link to="/" className="btn-primary">
              Go to overview
            </Link>
          }
        />
      </div>
    );
  }

  const score = scorePercent(report);
  const vectorPct = vectorCoveragePercent(report);
  const checkedLabel = formatCheckedAt(report.checkedAt);

  return (
    <div>
      <PageToolbar
        eyebrow="Report"
        title="Report Viewer"
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span>
              {report.target} · {report.mode} mode
              {checkedLabel ? ` · checked ${checkedLabel}` : ""}
            </span>
            {checkMeta ? <CheckSourceBadge kind={checkMeta.kind} /> : null}
          </span>
        }
        actions={
          <>
            <div className="hidden flex-wrap gap-2 md:flex">
              <button
                type="button"
                onClick={() => downloadJson(`${report.target}-report.json`, report)}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export JSON
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                type="button"
                onClick={rerunCheck}
                disabled={progress.active || !checkMeta || checksDisabled}
                title={checksDisabled ? "API offline" : undefined}
                className="btn-secondary inline-flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" />
                Re-run check
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="btn-secondary text-[color:var(--muted)]"
              >
                Clear
              </button>
            </div>
            <button
              type="button"
              className="btn-secondary inline-flex items-center gap-2 md:hidden"
              onClick={() => setMobileActions((v) => !v)}
              aria-expanded={mobileActions}
              aria-label="Report actions"
            >
              <MoreHorizontal className="h-4 w-4" />
              Actions
            </button>
          </>
        }
      />

      {mobileActions ? (
        <div className="mb-4 flex flex-wrap gap-2 md:hidden">
          <button
            type="button"
            onClick={() => downloadJson(`${report.target}-report.json`, report)}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button type="button" onClick={handleCopy} className="btn-secondary inline-flex items-center gap-2">
            <Copy className="h-4 w-4" />
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={rerunCheck}
            disabled={progress.active || !checkMeta || checksDisabled}
            className="btn-secondary inline-flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Re-run
          </button>
          <button type="button" onClick={() => setConfirmClear(true)} className="btn-secondary">
            Clear
          </button>
        </div>
      ) : null}

      {confirmClear ? (
        <Panel className="mb-4 border-[color:var(--warn)]/30">
          <p className="text-sm">Clear the current report from this session?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={handleClear} className="btn-primary">
              Yes, clear
            </button>
            <button type="button" onClick={() => setConfirmClear(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </Panel>
      ) : null}

      {progress.active ? (
        <LoadingProgress progress={progress.progress} step={progress.currentStep} className="mb-4" />
      ) : null}
      {error ? (
        <div className="mb-4">
          <ErrorPanel message={error} />
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[300px_1fr]">
        <Panel>
          <ConformanceScore percent={score} passed={report.passed} />
          <div className="mt-6 space-y-3 border-t border-[color:var(--border)] pt-4 text-sm">
            <Row label="Result">
              <StatusBadge status={report.passed ? "pass" : "fail"} />
            </Row>
            <Row label="Pass">{report.summary.pass}</Row>
            <Row label="Fail">{report.summary.fail}</Row>
            <Row label="Warn">{report.summary.warn}</Row>
            <Row label="Vector coverage">{vectorPct}%</Row>
          </div>
        </Panel>

        <div className="grid gap-4">
          <Panel title="Category breakdown">
            <CategoryBreakdown data={categoryBreakdown(report)} />
          </Panel>
          {report.vectors?.length ? (
            <Panel title="Vector heatmap">
              <VectorHeatmap vectors={report.vectors} checks={report.checks} />
            </Panel>
          ) : null}
        </div>
      </div>

      <Panel title="Interface checks" className="mt-4">
        <CheckList checks={report.checks} />
      </Panel>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[color:var(--muted)]">{label}</span>
      <span>{children}</span>
    </div>
  );
}
