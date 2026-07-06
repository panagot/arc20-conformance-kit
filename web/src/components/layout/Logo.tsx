import { cn } from "../../lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("h-9 w-9 shrink-0", className)}
    >
      <rect
        x="1"
        y="1"
        width="38"
        height="38"
        rx="9"
        fill="var(--panel, #ffffff)"
        stroke="var(--border, #e7e5e4)"
      />
      <path
        d="M20 8.5L29 12.75V19.75C29 24.95 24.95 29.5 20 30.75C15.05 29.5 11 24.95 11 19.75V12.75L20 8.5Z"
        fill="var(--panel-2, #f5f3ef)"
        stroke="var(--accent, #1c1917)"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M15.25 19.75L18.15 22.65L24.75 16.05"
        stroke="var(--pass, #059669)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="13.5"
        y="31.5"
        width="13"
        height="4.5"
        rx="2.25"
        fill="var(--accent, #1c1917)"
      />
      <path
        d="M16.2 33.75H17.45M22.55 33.75H23.8"
        stroke="var(--accent-contrast, #faf9f7)"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <path
        d="M19.15 32.55V35"
        stroke="var(--accent-contrast, #faf9f7)"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
    </svg>
  );
}
