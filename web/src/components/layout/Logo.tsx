import { cn } from "../../lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("h-9 w-9 shrink-0", className)}
    >
      <rect
        x="0.5"
        y="0.5"
        width="35"
        height="35"
        rx="4"
        fill="var(--panel, #ffffff)"
        stroke="var(--border, #e7e5e4)"
      />
      <path
        d="M18 7.5L26.5 11.5V18.5C26.5 23.2 22.8 27.4 18 28.5C13.2 27.4 9.5 23.2 9.5 18.5V11.5L18 7.5Z"
        stroke="var(--accent, #1c1917)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 18.5L16.75 20.75L21.5 16"
        stroke="var(--pass, #059669)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="18"
        y="26.5"
        textAnchor="middle"
        fill="var(--accent, #1c1917)"
        fontFamily="system-ui, sans-serif"
        fontSize="6.5"
        fontWeight="700"
        letterSpacing="0.04em"
      >
        20
      </text>
    </svg>
  );
}
