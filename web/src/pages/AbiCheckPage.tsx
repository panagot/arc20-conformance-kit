import { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Link, useNavigate } from "react-router-dom";
import { Upload } from "lucide-react";

import { checkAbi, fetchDemoAbi } from "../api";
import { PageToolbar, Panel } from "../components/layout/PageToolbar";
import { LoadingProgress } from "../components/ui/LoadingProgress";
import { ErrorPanel } from "../components/ui/ErrorPanel";
import { useReport } from "../context/ReportContext";
import { useToast } from "../context/ToastContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { useShellContext } from "../hooks/useShellContext";
import { useStagedProgress } from "../hooks/useStagedProgress";

const steps = [
  "Parsing ABI JSON",
  "Matching IARC20 signatures",
  "Validating Token record",
  "Computing vector coverage",
];

function parseAbiError(err: unknown): string {
  if (err instanceof SyntaxError) {
    return "Invalid JSON — paste the abi.json output from leo build.";
  }
  return err instanceof Error ? err.message : String(err);
}

export function AbiCheckPage() {
  usePageTitle("ABI Check");
  const navigate = useNavigate();
  const { setReport } = useReport();
  const { pushToast } = useToast();
  const { apiOnline, apiReady } = useShellContext();
  const checksDisabled = !apiReady || (apiReady && !apiOnline);
  const [abiText, setAbiText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const progress = useStagedProgress(steps);

  const onDrop = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setFileName(file.name);
    file.text().then(setAbiText).catch(() => setError("Could not read uploaded file"));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/json": [".json"] },
    multiple: false,
    disabled: checksDisabled,
  });

  const dropProps = getRootProps({
    "aria-label": "Upload abi.json file",
  });

  async function loadSample() {
    if (checksDisabled) return;
    setError(null);
    try {
      const abi = await fetchDemoAbi();
      setAbiText(JSON.stringify(abi, null, 2));
      setFileName("conforming-abi.json (sample)");
      pushToast("Sample ABI loaded", "success");
    } catch (err) {
      setError(parseAbiError(err));
    }
  }

  async function runCheck() {
    if (checksDisabled) return;
    setError(null);
    progress.start();
    try {
      const abi = JSON.parse(abiText);
      if (!abi?.program) throw new Error("ABI must include a program field");
      const report = await checkAbi(abi);
      progress.complete();
      setReport(report, { kind: "abi", abi });
      pushToast("ABI check complete", "success");
      navigate("/report");
    } catch (err) {
      progress.reset();
      setError(parseAbiError(err));
    }
  }

  return (
    <div>
      <PageToolbar
        eyebrow="Validate"
        title="ABI Checker"
        description="Upload or paste abi.json from leo build. Validates IARC20 entry functions, view accessors, and Token record shape."
      />

      <Panel className="mb-4">
        <p className="text-sm text-[color:var(--muted)]">
          Local builds only — for deployed programs use{" "}
          <Link to="/check/program">Program Check</Link>.
        </p>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Upload">
          <div
            {...dropProps}
            className={`rounded-[4px] border border-dashed px-6 py-10 text-center transition-colors ${
              checksDisabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:border-[color:var(--accent)]/40"
            } ${
              isDragActive
                ? "border-[color:var(--accent)] bg-[color:var(--accent)]/8"
                : "border-[color:var(--border)]"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-6 w-6 text-[color:var(--accent)]" />
            <p className="mt-3 font-medium">Drop abi.json here</p>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Typically at build/&lt;program&gt;/abi.json after leo build
            </p>
          </div>
          <button
            type="button"
            onClick={loadSample}
            disabled={checksDisabled}
            className="btn-secondary mt-3 w-full disabled:opacity-50"
          >
            Load sample ABI
          </button>
        </Panel>

        <Panel title="Paste JSON">
          {fileName ? (
            <div className="mb-3 inline-flex rounded-[4px] border border-[color:var(--border)] px-2 py-1 font-display text-[11px] text-[color:var(--accent-2)]">
              {fileName}
            </div>
          ) : null}
          <textarea
            value={abiText}
            onChange={(e) => setAbiText(e.target.value)}
            placeholder='{"program":"my_token.aleo","functions":[...]}'
            className="input-field min-h-[260px] w-full font-display text-xs leading-relaxed"
            disabled={checksDisabled}
          />
          <div className="mt-4">
            <button
              type="button"
              disabled={!abiText.trim() || progress.active || checksDisabled}
              onClick={runCheck}
              title={checksDisabled ? "API offline" : undefined}
              className="btn-primary disabled:opacity-50"
            >
              Validate ABI
            </button>
          </div>
        </Panel>
      </div>

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
