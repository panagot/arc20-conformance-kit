import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

export function PageToolbar({
  eyebrow = "Workstation",
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 border-b border-[color:var(--border)] pb-5 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div>
        <p className="section-eyebrow">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.02em]">{title}</h1>
        {description ? (
          <div className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--muted)]">
            {description}
          </div>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <section className={cn("instrument-panel overflow-hidden", className)}>
      {title ? (
        <div className="border-b border-[color:var(--border)] px-5 py-3">
          <h2 className="font-display text-[11px] uppercase tracking-[0.14em] text-[color:var(--muted)]">
            {title}
          </h2>
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}
