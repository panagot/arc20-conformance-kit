import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import { PageToolbar, Panel } from "../components/layout/PageToolbar";
import { ErrorPanel } from "../components/ui/ErrorPanel";
import { LoadingProgress } from "../components/ui/LoadingProgress";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useReport } from "../context/ReportContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { useShellContext } from "../hooks/useShellContext";
import { useSpecQuery } from "../hooks/useSpecQuery";
import { cn } from "../lib/cn";
import type { RawConformanceVector } from "../types";

const categories = ["all", "transfer", "approval", "record", "views"] as const;

function coverageForVector(
  vector: RawConformanceVector,
  reportChecks: Set<string> | null,
): "full" | "partial" | "none" | "unknown" {
  if (!reportChecks || !vector.static_checks?.length) return "unknown";
  const missing = vector.static_checks.filter((name) => !reportChecks.has(name));
  if (missing.length === 0) return "full";
  if (missing.length < vector.static_checks.length) return "partial";
  return "none";
}

export function VectorsPage() {
  usePageTitle("Vectors");
  const { apiOnline, apiReady } = useShellContext();
  const { data, isLoading, error } = useSpecQuery();
  const { report } = useReport();
  const [category, setCategory] = useState<(typeof categories)[number]>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const passedCheckNames = useMemo(() => {
    if (!report) return null;
    return new Set(
      report.checks
        .filter((c) => c.status === "pass")
        .flatMap((c) => {
          const parts = c.id.split(":");
          return parts[1] ? [parts[1]] : [];
        }),
    );
  }, [report]);

  const filtered = useMemo(() => {
    if (!data?.vectors) return [];
    if (category === "all") return data.vectors;
    return data.vectors.filter((vector) => vector.category === category);
  }, [data?.vectors, category]);

  const counts = useMemo(() => {
    const all = data?.vectors ?? [];
    return Object.fromEntries(
      categories.map((cat) => [
        cat,
        cat === "all" ? all.length : all.filter((v) => v.category === cat).length,
      ]),
    ) as Record<(typeof categories)[number], number>;
  }, [data?.vectors]);

  if (isLoading) {
    return (
      <div>
        <PageToolbar eyebrow="Reference" title="Test Vectors" />
        <LoadingProgress progress={68} step="Loading behavioral vectors" />
      </div>
    );
  }

  if (error || !data) {
    const offline = apiReady && !apiOnline;
    return (
      <div>
        <PageToolbar eyebrow="Reference" title="Test Vectors" />
        <ErrorPanel
          message={
            offline
              ? "API offline — start the workstation with npm run dev:web (port 8787), then refresh."
              : error instanceof Error
                ? error.message
                : "Failed to load vectors"
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageToolbar
        eyebrow="Reference"
        title="Behavioral Test Vectors"
        description="Twelve integrator QA scenarios for IARC20. When a report is loaded, cards show your static coverage."
      />

      {report ? (
        <Panel className="mb-4">
          <p className="text-sm text-[color:var(--muted)]">
            Overlay active for <strong>{report.target}</strong> — open{" "}
            <Link to="/report">full report</Link> for details.
          </p>
        </Panel>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={cn(
              "rounded-[4px] border px-3 py-1.5 font-display text-[11px] uppercase tracking-[0.1em]",
              category === item
                ? "border-[color:var(--accent)]/50 bg-[color:var(--accent)]/10"
                : "border-[color:var(--border)] text-[color:var(--muted)]",
            )}
          >
            {item} ({counts[item]})
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {filtered.map((vector) => {
          const coverage = coverageForVector(vector, passedCheckNames);
          const isOpen = expanded === vector.id;
          const panelId = `vector-panel-${vector.id}`;
          return (
            <Panel key={vector.id}>
              <button
                type="button"
                className="flex w-full items-start justify-between gap-3 text-left"
                onClick={() => setExpanded(isOpen ? null : vector.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <div>
                  <div className="section-eyebrow">{vector.id}</div>
                  <h3 className="mt-1 text-lg font-semibold">{vector.title}</h3>
                </div>
                <div className="flex shrink-0 items-start gap-2">
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm text-[color:var(--muted)]">{vector.category}</span>
                    {coverage !== "unknown" ? (
                      <StatusBadge status={coverage} />
                    ) : (
                      <span className="text-xs text-[color:var(--muted)]">No report</span>
                    )}
                  </div>
                  <ChevronDown
                    className={cn(
                      "mt-1 h-4 w-4 text-[color:var(--muted)] transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </div>
              </button>
              {isOpen ? (
                <div id={panelId} className="mt-4 border-t border-[color:var(--border)] pt-4">
                  {vector.description ? (
                    <p className="text-sm leading-relaxed text-[color:var(--muted)]">
                      {vector.description}
                    </p>
                  ) : null}
                  {vector.static_checks?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {vector.static_checks.map((check) => (
                        <code
                          key={check}
                          className="rounded-[4px] border border-[color:var(--border)] bg-[color:var(--input-bg)] px-2 py-1 font-display text-[10px]"
                        >
                          {check}
                        </code>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
