import { useState } from "react";

import { cn } from "../../lib/cn";
import type { CheckResult, ConformanceVector } from "../../types";

const tone: Record<ConformanceVector["staticCoverage"], string> = {
  full: "bg-[color:var(--pass)]",
  partial: "bg-[color:var(--warn)]",
  none: "bg-[color:var(--fail)]",
};

const coverageLabel: Record<ConformanceVector["staticCoverage"], string> = {
  full: "Full coverage",
  partial: "Partial coverage",
  none: "No coverage",
};

export function VectorHeatmap({
  vectors,
  checks,
}: {
  vectors: ConformanceVector[];
  checks?: CheckResult[];
}) {
  const [selected, setSelected] = useState<ConformanceVector | null>(null);

  return (
    <div>
      <div
        className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12"
        role="list"
        aria-label="Vector coverage heatmap"
      >
        {vectors.map((vector) => (
          <button
            key={vector.id}
            type="button"
            role="listitem"
            onClick={() => setSelected(vector)}
            aria-label={`${vector.id}: ${vector.title}, ${coverageLabel[vector.staticCoverage]}`}
            aria-pressed={selected?.id === vector.id}
            className={cn(
              "group relative aspect-square rounded-[4px] border bg-[color:var(--panel-2)] p-1 transition-transform hover:scale-[1.03]",
              selected?.id === vector.id
                ? "border-[color:var(--accent)]"
                : "border-[color:var(--border)]",
            )}
          >
            <div
              className={cn(
                "h-full w-full rounded-[2px] opacity-90",
                tone[vector.staticCoverage],
              )}
            />
            <span className="absolute bottom-1 left-1 rounded-[2px] px-1 font-display text-[10px] font-semibold text-white" style={{ background: "var(--heatmap-label-bg)" }}>
              {vector.id.replace("IARC20-", "")}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-[color:var(--muted)]">
        <Legend color="var(--pass)" label="Full" />
        <Legend color="var(--warn)" label="Partial" />
        <Legend color="var(--fail)" label="None" />
      </div>

      {selected ? (
        <div className="mt-4 rounded-[4px] border border-[color:var(--border)] bg-[color:var(--panel-2)] p-4 text-sm">
          <div className="font-display text-[11px] uppercase tracking-[0.12em] text-[color:var(--accent)]">
            {selected.id}
          </div>
          <div className="mt-1 font-medium">{selected.title}</div>
          <p className="mt-2 text-[color:var(--muted)]">{selected.category}</p>
          {selected.missingChecks.length ? (
            <p className="mt-2 text-[color:var(--fail)]">
              Missing checks: {selected.missingChecks.join(", ")}
            </p>
          ) : (
            <p className="mt-2 text-[color:var(--pass)]">All required static checks present.</p>
          )}
          {checks?.length ? (
            <ul className="mt-3 space-y-1 text-xs text-[color:var(--muted)]">
              {checks
                .filter((check) =>
                  selected.missingChecks.some((name) => check.id.includes(name)),
                )
                .slice(0, 4)
                .map((check) => (
                  <li key={check.id}>
                    {check.status}: {check.message}
                  </li>
                ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-2 w-2 rounded-[1px]" style={{ background: color }} />
      {label}
    </span>
  );
}
