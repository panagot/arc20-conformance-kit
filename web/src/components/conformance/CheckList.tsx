import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";

import { cn } from "../../lib/cn";
import type { CheckResult, CheckStatus } from "../../types";
import { StatusBadge } from "../ui/StatusBadge";

const filters: Array<CheckStatus | "all"> = ["all", "pass", "fail", "warn"];

function specLinkForCheck(check: CheckResult): string | null {
  if (check.id.startsWith("fn:") || check.id.startsWith("view:")) {
    const name = check.id.split(":")[1];
    return name ? `/spec#${name}` : "/spec";
  }
  if (check.id.startsWith("record:")) return "/spec#Token";
  return null;
}

function initialFilter(params: URLSearchParams): CheckStatus | "all" {
  const value = params.get("filter");
  if (value === "pass" || value === "fail" || value === "warn") return value;
  return "all";
}

export function CheckList({ checks }: { checks: CheckResult[] }) {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CheckStatus | "all">(() =>
    initialFilter(searchParams),
  );

  useEffect(() => {
    setFilter(initialFilter(searchParams));
  }, [searchParams]);

  const filtered = useMemo(() => {
    return checks.filter((check) => {
      if (filter !== "all" && check.status !== filter) return false;
      if (!query.trim()) return true;
      const haystack = `${check.id} ${check.message} ${check.details ?? ""}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
  }, [checks, filter, query]);

  const counts = useMemo(() => {
    return {
      all: checks.length,
      pass: checks.filter((c) => c.status === "pass").length,
      fail: checks.filter((c) => c.status === "fail").length,
      warn: checks.filter((c) => c.status === "warn").length,
    };
  }, [checks]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search checks…"
            className="input-field w-full py-2 pl-9"
            aria-label="Search checks"
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              aria-pressed={filter === item}
              className={cn(
                "rounded-[4px] border px-3 py-1.5 font-display text-[11px] uppercase tracking-[0.1em]",
                filter === item
                  ? "border-[color:var(--accent)]/50 bg-[color:var(--accent)]/10"
                  : "border-[color:var(--border)] text-[color:var(--muted)]",
              )}
            >
              {item} ({counts[item]})
            </button>
          ))}
        </div>
      </div>

      <ul className="grid gap-2">
        {filtered.map((check) => {
          const specLink = specLinkForCheck(check);
          return (
            <li
              key={check.id}
              className="grid grid-cols-[auto_1fr] gap-3 rounded-[4px] border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-3"
            >
              <StatusBadge status={check.status} />
              <div>
                <div className="font-medium">{check.message}</div>
                <div className="mt-1 flex flex-wrap items-center gap-3 font-display text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
                  <span>{check.id}</span>
                  {specLink && (check.status === "fail" || check.status === "warn") ? (
                    <Link to={specLink} className="normal-case tracking-normal">
                      View in spec →
                    </Link>
                  ) : null}
                </div>
                {check.details ? (
                  <p className="mt-2 text-sm text-[color:var(--muted)]">{check.details}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      {!filtered.length ? (
        <p className="py-8 text-center text-sm text-[color:var(--muted)]">
          No checks match your filters.
        </p>
      ) : null}
    </div>
  );
}
