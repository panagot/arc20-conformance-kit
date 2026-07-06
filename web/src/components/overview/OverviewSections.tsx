import { Link } from "react-router-dom";
import { ArrowRight, Upload, Zap } from "lucide-react";

export function ScorePlaceholder({
  onRunDemo,
  disabled,
}: {
  onRunDemo: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-4 py-6 text-center">
      <div className="relative flex h-36 w-36 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="var(--ring-track)"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="var(--ring-accent)"
            strokeWidth="8"
            strokeDasharray="327"
            strokeDashoffset="280"
            strokeLinecap="butt"
          />
        </svg>
        <div>
          <div className="font-display text-3xl font-semibold text-[color:var(--muted)]">—</div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--muted)]">
            Awaiting check
          </div>
        </div>
      </div>

      <p className="mt-4 max-w-xs text-sm leading-relaxed text-[color:var(--muted)]">
        Run the demo or validate your own ABI to see conformance score, vector heatmap, and category breakdown.
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onRunDemo}
          disabled={disabled}
          className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Zap className="h-4 w-4" />
          Run demo
        </button>
        <Link to="/check/abi" className="btn-secondary inline-flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload ABI
        </Link>
      </div>
    </div>
  );
}

export function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Build or deploy",
      body: "Run leo build locally, or use a deployed program ID on testnet/mainnet.",
    },
    {
      n: "02",
      title: "Validate interface",
      body: "ABI Check compares signatures to IARC20. Program Check scans deployed source.",
    },
    {
      n: "03",
      title: "Review report",
      body: "See score %, failing checks, and which behavioral vectors are covered.",
    },
  ];

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="section-eyebrow">Workflow</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em]">How it works</h2>
        </div>
        <Link to="/about" className="hidden items-center gap-1 text-sm text-[color:var(--muted)] sm:inline-flex">
          Learn more <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.n}
            className="instrument-panel rounded-[6px] p-5"
          >
            <div className="font-display text-[11px] uppercase tracking-[0.16em] text-[color:var(--accent)]">
              Step {step.n}
            </div>
            <h3 className="mt-2 font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
