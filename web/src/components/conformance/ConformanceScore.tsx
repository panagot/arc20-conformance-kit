import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { cn } from "../../lib/cn";

export function ConformanceScore({
  percent,
  passed,
  label = "Conformance score",
  size = 168,
}: {
  percent: number;
  passed: boolean;
  label?: string;
  size?: number;
}) {
  const [display, setDisplay] = useState(0);
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const start = window.setTimeout(() => setDisplay(percent), 80);
    return () => window.clearTimeout(start);
  }, [percent]);

  const offset = circumference - (display / 100) * circumference;
  const tone = passed ? "var(--pass)" : display >= 70 ? "var(--warn)" : "var(--fail)";

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--ring-track)"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={tone}
            strokeWidth={stroke}
            strokeLinecap="butt"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-4xl font-semibold tabular-nums">{display}%</span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[color:var(--muted)]">
            {passed ? "Pass" : "Review"}
          </span>
        </div>
      </div>
      <p className="mt-3 font-display text-xs uppercase tracking-[0.14em] text-[color:var(--muted)]">
        {label}
      </p>
    </div>
  );
}

export function MiniScore({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end gap-2", className)}>
      <span className="font-display text-5xl font-semibold leading-none tabular-nums text-[color:var(--accent)]">
        {percent}
      </span>
      <span className="pb-1 font-display text-xl text-[color:var(--muted)]">%</span>
    </div>
  );
}
