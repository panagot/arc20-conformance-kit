import { FileJson } from "lucide-react";

import { cn } from "../../lib/cn";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[6px] border border-dashed border-[color:var(--border)] bg-[color:var(--panel)] px-8 py-16 text-center",
        className,
      )}
    >
      <div className="mb-4 rounded-[4px] border border-[color:var(--border)] bg-[color:var(--panel-2)] p-3">
        <FileJson className="h-6 w-6 text-[color:var(--accent)]" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-[color:var(--muted)]">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
