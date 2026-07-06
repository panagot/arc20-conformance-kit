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

function vectorNumber(id: string) {
  return id.replace("IARC20-", "");
}

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
        className="grid grid-cols-6 gap-1.5 sm:grid-cols-12 sm:gap-1"
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
              "group relative flex aspect-square min-h-[2.25rem] items-center justify-center rounded-[4px] border transition-[transform,box-shadow]",
              tone[vector.staticCoverage],
              selected?.id === vector.id
                ? "z-[1] scale-[1.04] border-[color:var(--accent)] shadow-[0_0_0_2px_var(--panel),0_0_0_3px_var(--accent)]"
                : "border-[color:var(--border)]/30 hover:scale-[1.03]",
            )}
          >
            <span className="font-display text-[10px] font-bold tabular-nums leading-none text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.25)] sm:text-[9px]">
              {vectorNumber(vector.id)}
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
