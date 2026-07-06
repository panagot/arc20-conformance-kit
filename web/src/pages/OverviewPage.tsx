import { Link } from "react-router-dom";
import { ArrowRight, Layers, ShieldCheck, Workflow } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";

import { fetchDemoReport } from "../api";
import { CategoryBreakdown } from "../components/conformance/CategoryBreakdown";
import { ConformanceScore } from "../components/conformance/ConformanceScore";
import { VectorHeatmap } from "../components/conformance/VectorHeatmap";
import { HowItWorks, ScorePlaceholder } from "../components/overview/OverviewSections";
import { Panel } from "../components/layout/PageToolbar";
import { LoadingProgress } from "../components/ui/LoadingProgress";
import { ErrorPanel } from "../components/ui/ErrorPanel";
import { CheckSourceBadge } from "../components/ui/StatusBadge";
import { useReport } from "../context/ReportContext";
import { useToast } from "../context/ToastContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { useRunDemoFromNav } from "../hooks/useRunDemoFromNav";
import { useShellContext } from "../hooks/useShellContext";
import { useSpecQuery } from "../hooks/useSpecQuery";
import { useStagedProgress } from "../hooks/useStagedProgress";
import {
  categoryBreakdown,
  scorePercent,
  vectorCoveragePercent,
} from "../lib/conformance-utils";

const demoSteps = [
  "Loading IARC20 specification",
  "Reading sample_token.aleo ABI",
  "Validating interface signatures",
  "Mapping behavioral vectors",
];

function formatTime(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return null;
  }
}

export function OverviewPage() {
  usePageTitle("Overview");
  const breakdownRef = useRef<HTMLElement>(null);
  const { report, checkMeta, setReport } = useReport();
  const { pushToast } = useToast();
  const { apiOnline, apiReady } = useShellContext();
  const checksDisabled = !apiReady || (apiReady && !apiOnline);
  const { data: specData, isLoading: specLoading } = useSpecQuery();
  const [error, setError] = useState<string | null>(null);
  const progress = useStagedProgress(demoSteps);

  const demoQuery = useQuery({
    queryKey: ["demo-report"],
    queryFn: fetchDemoReport,
    enabled: false,
  });

  const runDemo = useCallback(async () => {
    if (checksDisabled) return;
    setError(null);
    progress.start();
    try {
      const result = await demoQuery.refetch();
      if (result.error) throw result.error;
      if (!result.data) throw new Error("Demo report unavailable");
      progress.complete();
      setReport(result.data, { kind: "demo" });
      pushToast("Demo complete — dashboard updated", "success");
      breakdownRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      progress.reset();
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [checksDisabled, demoQuery, progress, pushToast, setReport]);

  useRunDemoFromNav(runDemo);

  return (
    <div>
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div>
          <p className="section-eyebrow">Aleo · IARC20 · Conformance QA</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.03em] lg:text-[2.65rem]">
            Does this Leo program actually implement ARC-20?
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[color:var(--muted)]">
            Validate ABI signatures, deployed program interfaces, and behavioral
            vector coverage before mainnet integration — built for wallet and DeFi teams.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={runDemo}
              disabled={progress.active || checksDisabled}
              title={!apiReady ? "Checking API…" : checksDisabled ? "API offline" : undefined}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              Run demo check
              <ArrowRight className="h-4 w-4" />
            </button>
            {checksDisabled ? (
              <button
                type="button"
                disabled
                className="btn-secondary inline-flex cursor-not-allowed opacity-50"
                title={!apiReady ? "Checking API…" : "API offline"}
              >
                Validate your ABI
              </button>
            ) : (
              <Link to="/check/abi" className="btn-secondary inline-flex items-center">
                Validate your ABI
              </Link>
            )}
            {report ? (
              <Link to="/report" className="btn-secondary inline-flex items-center">
                Full report
              </Link>
            ) : null}
          </div>

          {progress.active ? (
            <div className="mt-6">
              <LoadingProgress progress={progress.progress} step={progress.currentStep} />
            </div>
          ) : null}
          {error ? (
            <div className="mt-4">
              <ErrorPanel message={error} />
            </div>
          ) : null}
        </div>

        <Panel className="instrument-panel relative min-h-[360px] overflow-hidden">
          {report ? (
            <div className="grid gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="section-eyebrow">Live score</p>
                  {checkMeta ? <CheckSourceBadge kind={checkMeta.kind} /> : null}
                </div>
                <p className="mt-1 text-lg font-medium">{report.target}</p>
                {formatTime(report.checkedAt) ? (
                  <p className="mt-1 text-xs text-[color:var(--muted)]">
                    Checked {formatTime(report.checkedAt)}
                  </p>
                ) : null}
              </div>
              <ConformanceScore
                percent={scorePercent(report)}
                passed={report.passed}
                size={160}
              />
              {report.vectors ? (
                <div>
                  <p className="mb-3 text-xs uppercase tracking-[0.12em] text-[color:var(--muted)]">
                    Vector coverage {vectorCoveragePercent(report)}%
                  </p>
                  <VectorHeatmap vectors={report.vectors} checks={report.checks} />
                </div>
              ) : null}
            </div>
          ) : (
            <ScorePlaceholder onRunDemo={runDemo} disabled={checksDisabled} />
          )}
        </Panel>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<ShieldCheck className="h-5 w-5 text-[color:var(--accent)]" />}
          label="Required functions"
          value={specLoading ? null : String(specData?.spec.functions.length ?? "—")}
        />
        <StatCard
          icon={<Layers className="h-5 w-5 text-[color:var(--accent)]" />}
          label="View accessors"
          value={specLoading ? null : String(specData?.spec.views.length ?? "—")}
        />
        <StatCard
          icon={<Workflow className="h-5 w-5 text-[color:var(--accent)]" />}
          label="Behavioral vectors"
          value={specLoading ? null : String(specData?.vectors.length ?? "—")}
        />
      </section>

      <HowItWorks />

      <section ref={breakdownRef} className="mt-10 grid gap-4 lg:grid-cols-2">
        <Panel title="Category breakdown">
          {report ? (
            <CategoryBreakdown data={categoryBreakdown(report)} />
          ) : (
            <div className="text-sm text-[color:var(--muted)]">
              <p>Run a check to see pass/fail/warn distribution by category.</p>
              <button
                type="button"
                onClick={runDemo}
                disabled={checksDisabled || progress.active}
                className="btn-secondary mt-4"
              >
                Run demo
              </button>
            </div>
          )}
        </Panel>
        <Panel title="Next steps">
          <ul className="space-y-3 text-sm leading-relaxed">
            <li><Link to="/check/abi">Upload abi.json from leo build →</Link></li>
            <li><Link to="/check/program">Check a deployed program →</Link></li>
            <li><Link to="/spec">Browse IARC20 spec →</Link></li>
            <li><Link to="/vectors">Review behavioral vectors →</Link></li>
          </ul>
        </Panel>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <Panel>
      <div className="flex items-center gap-3">
        <div className="rounded-[4px] border border-[color:var(--border)] bg-[color:var(--panel-2)] p-2">
          {icon}
        </div>
        <div>
          {value === null ? (
            <div className="skeleton h-8 w-12 rounded-[4px]" />
          ) : (
            <div className="font-display text-2xl font-semibold tabular-nums">{value}</div>
          )}
          <div className="text-sm text-[color:var(--muted)]">{label}</div>
        </div>
      </div>
    </Panel>
  );
}
