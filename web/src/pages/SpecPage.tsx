import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { PageToolbar, Panel } from "../components/layout/PageToolbar";
import { ErrorPanel } from "../components/ui/ErrorPanel";
import { LoadingProgress } from "../components/ui/LoadingProgress";
import { usePageTitle } from "../hooks/usePageTitle";
import { useShellContext } from "../hooks/useShellContext";
import { useSpecQuery } from "../hooks/useSpecQuery";

export function SpecPage() {
  usePageTitle("IARC20 Spec");
  const { apiOnline, apiReady } = useShellContext();
  const { data, isLoading, error } = useSpecQuery();
  const [query, setQuery] = useState("");

  const functions = useMemo(() => {
    if (!data?.spec.functions) return [];
    const q = query.toLowerCase();
    return data.spec.functions.filter(
      (fn) => !q || fn.name.toLowerCase().includes(q) || fn.category.includes(q),
    );
  }, [data?.spec.functions, query]);

  const views = useMemo(() => {
    if (!data?.spec.views) return [];
    const q = query.toLowerCase();
    return data.spec.views.filter((view) => !q || view.name.toLowerCase().includes(q));
  }, [data?.spec.views, query]);

  const noResults = query.trim() && !functions.length && !views.length;

  if (isLoading) {
    return (
      <div>
        <PageToolbar eyebrow="Reference" title="IARC20 Spec" description="Loading specification…" />
        <LoadingProgress progress={72} step="Loading IARC20 specification" />
      </div>
    );
  }

  if (error || !data) {
    const offline = apiReady && !apiOnline;
    return (
      <div>
        <PageToolbar eyebrow="Reference" title="IARC20 Spec" />
        <ErrorPanel
          message={
            offline
              ? "API offline — start the workstation with npm run dev:web (port 8787), then refresh."
              : error instanceof Error
                ? error.message
                : "Failed to load spec"
          }
        />
      </div>
    );
  }

  const { spec } = data;

  return (
    <div>
      <PageToolbar
        eyebrow="Reference"
        title="IARC20 Spec Browser"
        description={`ARC-${spec.arc} ${spec.interface} · ${spec.status}. Aleo fungible token standard for dynamic dispatch.`}
      />

      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search functions and views…"
          className="input-field w-full py-2 pl-9"
          aria-label="Search spec"
        />
      </div>

      {noResults ? (
        <Panel className="mb-4">
          <p className="text-sm text-[color:var(--muted)]">
            No functions or views match &ldquo;{query}&rdquo;. Try transfer, approve, or balance_of.
          </p>
        </Panel>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Required entry functions">
          <ul className="grid gap-2">
            {functions.map((fn) => (
              <li
                key={fn.name}
                id={fn.name}
                className="scroll-mt-24 rounded-[4px] border border-[color:var(--border)] px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <code>{fn.name}</code>
                  <span className="text-[color:var(--muted)]">{fn.category}</span>
                </div>
                {fn.inputs?.length || fn.outputs?.length ? (
                  <p className="mt-2 font-display text-[10px] text-[color:var(--muted)]">
                    {fn.inputs?.length
                      ? `in: ${fn.inputs.map((v) => String(v)).join(", ")}`
                      : ""}
                    {fn.inputs?.length && fn.outputs?.length ? " · " : ""}
                    {fn.outputs?.length
                      ? `out: ${fn.outputs.map((v) => String(v)).join(", ")}`
                      : ""}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="View accessors">
          <ul className="grid gap-2">
            {views.map((view) => (
              <li
                key={view.name}
                id={view.name}
                className="scroll-mt-24 rounded-[4px] border border-[color:var(--border)] px-3 py-2 font-display text-xs"
              >
                {view.name}()
                {view.output ? (
                  <span className="ml-2 text-[color:var(--muted)]">→ {view.output}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {spec.record ? (
        <Panel title="Token record" className="mt-4">
          <p className="mb-3 text-sm text-[color:var(--muted)]">
            Record <code id="Token">Token</code> must include:
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {spec.record.required_fields.map((field) => (
              <li
                key={field.name}
                className="rounded-[4px] border border-[color:var(--border)] px-3 py-2 font-display text-xs"
              >
                {field.name}: {field.type}
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {spec.design_rules?.length ? (
        <Panel title="Design rules" className="mt-4">
          <ul className="grid gap-3 md:grid-cols-2">
            {spec.design_rules.map((rule) => (
              <li key={rule.id} className="rounded-[4px] border border-[color:var(--border)] px-4 py-3">
                <div className="section-eyebrow">{rule.id}</div>
                <div className="mt-1 font-medium">{rule.title}</div>
                <p className="mt-1 text-sm text-[color:var(--muted)]">{rule.description}</p>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </div>
  );
}
