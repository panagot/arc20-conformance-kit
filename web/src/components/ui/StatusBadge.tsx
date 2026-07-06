const LABELS: Record<string, string> = {
  pass: "Pass",
  fail: "Fail",
  warn: "Warn",
  skip: "Skip",
  full: "Full",
  partial: "Partial",
  none: "None",
};

const styles: Record<string, string> = {
  pass: "border-[color:var(--pass)]/35 bg-[color:var(--pass)]/10 text-[color:var(--pass)]",
  fail: "border-[color:var(--fail)]/35 bg-[color:var(--fail)]/10 text-[color:var(--fail)]",
  warn: "border-[color:var(--warn)]/35 bg-[color:var(--warn)]/10 text-[color:var(--warn)]",
  skip: "border-[color:var(--muted)]/25 bg-white/5 text-[color:var(--muted)]",
  full: "border-[color:var(--pass)]/35 bg-[color:var(--pass)]/10 text-[color:var(--pass)]",
  partial: "border-[color:var(--warn)]/35 bg-[color:var(--warn)]/10 text-[color:var(--warn)]",
  none: "border-[color:var(--fail)]/35 bg-[color:var(--fail)]/10 text-[color:var(--fail)]",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const tone = styles[status] ?? styles.warn;
  const label = LABELS[status] ?? status;
  return (
    <span
      className={`inline-flex items-center rounded-[4px] border px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.14em] ${tone} ${className ?? ""}`}
    >
      {label}
    </span>
  );
}

export function CheckSourceBadge({ kind }: { kind: "demo" | "abi" | "program" }) {
  const labels = { demo: "Demo", abi: "ABI check", program: "Program check" };
  return (
    <span className="inline-flex rounded-[4px] border border-[color:var(--border)] bg-[color:var(--panel-2)] px-2 py-0.5 font-display text-[10px] uppercase tracking-[0.12em] text-[color:var(--accent-2)]">
      {labels[kind]}
    </span>
  );
}
