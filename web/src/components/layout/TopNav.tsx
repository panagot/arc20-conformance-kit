import { Link, NavLink } from "react-router-dom";
import { BookOpen, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useReport } from "../../context/ReportContext";
import { cn } from "../../lib/cn";
import { scorePercent } from "../../lib/conformance-utils";
import { Logo } from "./Logo";

const links = [
  { to: "/", label: "Overview" },
  { to: "/check/abi", label: "ABI Check" },
  { to: "/check/program", label: "Program Check" },
  { to: "/report", label: "Report" },
  { to: "/spec", label: "IARC20 Spec" },
  { to: "/vectors", label: "Vectors" },
  { to: "/about", label: "About" },
];

export function TopNav({
  apiOnline,
  apiReady,
}: {
  apiOnline: boolean;
  apiReady: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { report } = useReport();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const statusColor = !apiReady
    ? "bg-[color:var(--muted)]"
    : apiOnline
      ? "bg-[color:var(--pass)]"
      : "bg-[color:var(--fail)]";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-[color:var(--border)] bg-[color:var(--bg)]/94 backdrop-blur-md transition-shadow",
        scrolled && "shadow-[0_8px_24px_var(--nav-shadow)]",
      )}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-[4px] focus:border focus:border-[color:var(--border)] focus:bg-[color:var(--panel)] focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-5 py-3 lg:px-8">
        <Link to="/" className="group flex items-center gap-3">
          <Logo />
          <div>
            <div className="font-display text-sm font-semibold tracking-[0.04em]">ARC-20 Kit</div>
            <div className="flex items-center gap-2 text-[11px] text-[color:var(--muted)]">
              IARC20 workstation
              <span
                className={cn("inline-block h-1.5 w-1.5 rounded-full", statusColor)}
                aria-hidden="true"
              />
              <span className="sr-only">
                {!apiReady ? "Checking API status" : apiOnline ? "API online" : "API offline"}
              </span>
              {apiReady ? (
                <span className="hidden sm:inline">
                  {apiOnline ? "API online" : "API offline"}
                </span>
              ) : (
                <span className="hidden sm:inline">Checking…</span>
              )}
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "rounded-[4px] px-3 py-2 text-[13px] transition-colors",
                  isActive
                    ? "bg-[color:var(--accent)]/12 font-medium text-[color:var(--text)]"
                    : "text-[color:var(--muted)] hover:text-[color:var(--text)]",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {report ? (
            <Link
              to="/report"
              className="rounded-[4px] border border-[color:var(--border)] px-3 py-1.5 font-display text-[11px] uppercase tracking-[0.1em] text-[color:var(--muted)] hover:text-[color:var(--text)]"
            >
              Last: {scorePercent(report)}%
            </Link>
          ) : null}
          <a
            href="https://github.com/ProvableHQ/ARCs/blob/master/arc-0020/README.md"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-[4px] border border-[color:var(--border)] px-3 py-2 text-sm text-[color:var(--muted)] hover:text-[color:var(--text)]"
          >
            <BookOpen className="h-4 w-4" />
            ARC-20
          </a>
          <Link to="/check/abi" className="btn-primary">
            Run check
          </Link>
        </div>

        <button
          type="button"
          className="rounded-[4px] border border-[color:var(--border)] p-2 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-[color:var(--border)] px-5 py-4 lg:hidden">
          <nav className="grid gap-1" aria-label="Mobile">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-[4px] px-3 py-2 text-sm",
                    isActive
                      ? "bg-[color:var(--accent)]/12 font-medium"
                      : "text-[color:var(--muted)]",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-[color:var(--border)] pt-4">
            {report ? (
              <Link to="/report" className="btn-secondary" onClick={() => setOpen(false)}>
                Last: {scorePercent(report)}%
              </Link>
            ) : null}
            <Link to="/check/abi" className="btn-primary" onClick={() => setOpen(false)}>
              Run check
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
