import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { checkProgram } from "../api";
import { PageToolbar, Panel } from "../components/layout/PageToolbar";
import { LoadingProgress } from "../components/ui/LoadingProgress";
import { ErrorPanel } from "../components/ui/ErrorPanel";
import { useReport } from "../context/ReportContext";
import { useToast } from "../context/ToastContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { useShellContext } from "../hooks/useShellContext";
import { useStagedProgress } from "../hooks/useStagedProgress";

const steps = [
  "Connecting to Provable API",
  "Fetching deployed program source",
  "Scanning IARC20 declarations",
  "Building conformance report",
];

const EXAMPLES = ["sample_token.aleo", "wrapped_credits.aleo"];

export function ProgramCheckPage() {
  usePageTitle("Program Check");
  const navigate = useNavigate();
  const { setReport } = useReport();
  const { pushToast } = useToast();
  const { apiOnline, apiReady } = useShellContext();
  const checksDisabled = !apiReady || (apiReady && !apiOnline);
  const [programId, setProgramId] = useState("");
  const [network, setNetwork] = useState<"mainnet" | "testnet">("testnet");
  const [error, setError] = useState<string | null>(null);
  const progress = useStagedProgress(steps);

  async function runCheck(id = programId.trim()) {
    if (checksDisabled) return;
    setError(null);
    const normalized = id.endsWith(".aleo") ? id : `${id}.aleo`;
    progress.start();
    try {
      const report = await checkProgram(normalized, network);
      progress.complete();
      setReport(report, { kind: "program", programId: normalized, network });
      pushToast("Program check complete", "success");
      navigate("/report");
    } catch (err) {
      progress.reset();
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div>
      <PageToolbar
        eyebrow="Validate"
        title="Program Checker"
        description="Validate a deployed Aleo program by ID via Provable API. Scans source for IARC20 function and view declarations."
      />

      <Panel className="mb-4">
        <p className="text-sm text-[color:var(--muted)]">
          Deployed programs only — for local builds use{" "}
          <Link to="/check/abi">ABI Check</Link>. Provable API rate limits apply.
        </p>
      </Panel>

      <Panel>
        <form
          className="grid gap-4 md:grid-cols-[1fr_180px_auto] md:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            runCheck();
          }}
        >
          <label className="grid gap-2 text-sm text-[color:var(--muted)]">
            Program ID
            <input
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              placeholder="my_token.aleo"
              className="input-field"
              disabled={checksDisabled}
            />
          </label>
          <label className="grid gap-2 text-sm text-[color:var(--muted)]">
            Network
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value as "mainnet" | "testnet")}
              className="input-field"
              disabled={checksDisabled}
            >
              <option value="testnet">testnet</option>
              <option value="mainnet">mainnet</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={!programId.trim() || progress.active || checksDisabled}
            title={checksDisabled ? "API offline" : undefined}
            className="btn-primary disabled:opacity-50"
          >
            Check program
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-[color:var(--muted)]">Try:</span>
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              disabled={checksDisabled || progress.active}
              onClick={() => {
                setProgramId(example);
                runCheck(example);
              }}
              className="rounded-[4px] border border-[color:var(--border)] px-2 py-1 font-display text-[11px] text-[color:var(--accent-2)] disabled:opacity-50"
            >
              {example}
            </button>
          ))}
        </div>
      </Panel>

      {progress.active ? (
        <div className="mt-4">
          <LoadingProgress progress={progress.progress} step={progress.currentStep} />
        </div>
      ) : null}
      {error ? (
        <div className="mt-4">
          <ErrorPanel message={error} />
        </div>
      ) : null}
    </div>
  );
}
