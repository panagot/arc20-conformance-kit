import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { cn } from "../../lib/cn";

export function LoadingProgress({
  progress,
  label,
  step,
  className,
}: {
  progress: number;
  label?: string;
  step?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[6px] border border-[color:var(--border)] bg-[color:var(--panel-2)] p-5",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
          <Loader2 className="h-4 w-4 animate-spin text-[color:var(--accent)]" />
          <span>{label ?? "Running conformance analysis"}</span>
        </div>
        <span className="font-display text-2xl font-semibold tabular-nums text-[color:var(--accent)]">
          {progress}%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--progress-from),var(--accent))]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "easeOut", duration: 0.25 }}
        />
      </div>
      {step ? (
        <p className="mt-3 font-display text-xs uppercase tracking-[0.12em] text-[color:var(--muted)]">
          {step}
        </p>
      ) : null}
    </div>
  );
}
