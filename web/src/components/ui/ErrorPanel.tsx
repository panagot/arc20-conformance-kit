import { AlertTriangle } from "lucide-react";

import { cn } from "../../lib/cn";

export function ErrorPanel({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-[6px] border border-[color:var(--fail)]/35 bg-[color:var(--fail)]/8 px-4 py-3 text-sm text-[#ffb4b4]",
        className,
      )}
      role="alert"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--fail)]" />
      <p className="leading-relaxed">{message}</p>
    </div>
  );
}
