import type { ConformanceReport } from "../types";
import { scorePercent, vectorCoveragePercent } from "../../lib/conformance-utils";

export interface AssistantLink {
  label: string;
  to: string;
  state?: Record<string, unknown>;
}

export interface AssistantReply {
  text: string;
  links?: AssistantLink[];
}

export function getAssistantReply(
  input: string,
  context: {
    pathname: string;
    report: ConformanceReport | null;
    apiOnline: boolean;
  },
): AssistantReply {
  const q = input.trim().toLowerCase();

  const actionIntents =
    q.includes("run demo") ||
    q === "demo" ||
    (q.includes("why") && q.includes("fail")) ||
    (q.includes("vector") && q.includes("missing")) ||
    q.includes("export") ||
    q.includes("ci") ||
    (q.includes("report") && !q.includes("what"));

  if (!context.apiOnline && (actionIntents || q.includes("api offline"))) {
    const isLocal =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    return {
      text: isLocal
        ? "The conformance API appears offline. Start the workstation with npm run dev:web (API on port 8787)."
        : "The conformance API is temporarily unavailable. Please try again in a moment.",
      links: [{ label: "Overview", to: "/" }],
    };
  }

  if (q.includes("run demo") || q === "demo") {
    return {
      text: "Starting the demo validates sample_token.aleo against all IARC20 checks and 12 behavioral vectors.",
      links: [{ label: "Run demo now", to: "/", state: { runDemo: true } }],
    };
  }

  if (q.includes("why") && q.includes("fail")) {
    if (!context.report) {
      return { text: "No report loaded yet.", links: [{ label: "Run check", to: "/check/abi" }] };
    }
    const fails = context.report.checks.filter((c) => c.status === "fail");
    return {
      text: fails.length
        ? `You have ${fails.length} failing checks: ${fails.slice(0, 4).map((f) => f.message).join("; ")}.`
        : "No failures — your report passed all interface checks.",
      links: [{ label: "View failures", to: "/report?filter=fail" }],
    };
  }

  if (q.includes("vector") && q.includes("missing")) {
    if (!context.report?.vectors) {
      return { text: "Run a check first to see vector coverage.", links: [{ label: "Overview", to: "/" }] };
    }
    const missing = context.report.vectors.filter((v) => v.staticCoverage !== "full");
    return {
      text: missing.length
        ? `${missing.length} vectors lack full static coverage: ${missing.map((v) => v.id).join(", ")}.`
        : "All 12 vectors have full static coverage.",
      links: [{ label: "Vectors page", to: "/vectors" }],
    };
  }

  if (q.includes("leo build")) {
    return {
      text: "Run leo build in your token project. The ABI lives at build/<program>/abi.json — paste it in ABI Check.",
      links: [{ label: "ABI Check", to: "/check/abi" }],
    };
  }

  if (q.includes("abi vs program") || q.includes("difference")) {
    return {
      text: "ABI Check validates local leo build output (abi.json). Program Check fetches deployed source via Provable API.",
      links: [
        { label: "ABI Check", to: "/check/abi" },
        { label: "Program Check", to: "/check/program" },
      ],
    };
  }

  if (q.includes("how") && (q.includes("check") || q.includes("token"))) {
    return {
      text: "Three steps: leo build → validate ABI or program ID → review Report for score and vector coverage.",
      links: [{ label: "ABI Check", to: "/check/abi" }, { label: "Spec", to: "/spec" }],
    };
  }

  if (q.includes("vector")) {
    return {
      text: "Behavioral vectors describe expected IARC20 scenarios. Static coverage maps your report checks to each vector.",
      links: [{ label: "Browse vectors", to: "/vectors" }],
    };
  }

  if (q.includes("iarc20") || q.includes("arc-20") || q.includes("spec")) {
    return {
      text: "IARC20: 11 entry functions, 7 view accessors, Token record with owner + amount (u128).",
      links: [
        { label: "Spec browser", to: "/spec" },
        { label: "Official ARC-20", to: "https://github.com/ProvableHQ/ARCs/blob/master/arc-0020/README.md" },
      ],
    };
  }

  if (q.includes("report") || q.includes("score") || q.includes("fail") || q.includes("explain")) {
    if (!context.report) {
      return {
        text: "No report loaded yet. Run a demo, ABI check, or program check first.",
        links: [{ label: "Start check", to: "/check/abi" }],
      };
    }
    const fails = context.report.checks.filter((c) => c.status === "fail");
    const score = scorePercent(context.report);
    const vectors = vectorCoveragePercent(context.report);
    const failSummary =
      fails.length > 0
        ? ` Failures: ${fails.slice(0, 3).map((f) => f.message).join("; ")}.`
        : "";
    return {
      text: `${context.report.target} scored ${score}% with ${vectors}% vector coverage.${failSummary}`,
      links: [{ label: "Full report", to: "/report" }],
    };
  }

  if (q.includes("export") || q.includes("ci")) {
    return {
      text: "Use Export JSON on the Report page for CI. CLI arc20-check exits 0/1 for pipelines.",
      links: [{ label: "Report", to: "/report" }],
    };
  }

  return {
    text: `Ask about IARC20 checks, reports, or vectors. Current page: ${context.pathname}.`,
    links: [{ label: "Overview", to: "/" }, { label: "About", to: "/about" }],
  };
}
