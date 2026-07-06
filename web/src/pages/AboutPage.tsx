import { Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

import { PageToolbar, Panel } from "../components/layout/PageToolbar";
import { useToast } from "../context/ToastContext";
import { usePageTitle } from "../hooks/usePageTitle";

const CLI_SNIPPET = `npm run dev -- --abi ./build/my_token/abi.json --vectors
npm run dev -- --program my_token.aleo --network testnet`;

export function AboutPage() {
  usePageTitle("About");
  const { pushToast } = useToast();
  const [copied, setCopied] = useState(false);

  async function copyCli() {
    await navigator.clipboard.writeText(CLI_SNIPPET);
    setCopied(true);
    pushToast("CLI commands copied", "success");
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <PageToolbar
        eyebrow="Tool"
        title="About ARC-20 Kit"
        description="Open-source IARC20 conformance QA for Aleo Leo token programs — for wallet teams, DeFi integrators, and token issuers."
      />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel title="What it does">
          <p className="text-sm leading-relaxed text-[color:var(--muted)]">
            Leo v4 introduced interfaces and dynamic dispatch so protocols can call any IARC20
            token at runtime. This workstation answers: does a token program actually implement
            the standard before you integrate it?
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[color:var(--muted)]">
            Complements{" "}
            <a href="https://github.com/ProvableHQ/ARCs/tree/master/arc-0020" target="_blank" rel="noreferrer">
              ProvableHQ/ARCs
            </a>{" "}
            with portable vectors, CI-friendly CLI output, and a visual report layer.
          </p>
        </Panel>

        <Panel title="CLI usage">
          <pre className="overflow-x-auto rounded-[4px] border border-[color:var(--border)] bg-[color:var(--input-bg)] p-4 font-display text-xs leading-relaxed text-[color:var(--muted)]">
            {CLI_SNIPPET}
          </pre>
          <button
            type="button"
            onClick={copyCli}
            className="btn-secondary mt-3 inline-flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied!" : "Copy commands"}
          </button>
        </Panel>
      </div>

      <Panel title="Source" className="mt-4">
        <p className="text-sm leading-relaxed text-[color:var(--muted)]">
          MIT-licensed open source. Report issues, suggest vectors, or contribute checks on GitHub.
        </p>
        <a
          href="https://github.com/panagot/arc20-conformance-kit"
          target="_blank"
          rel="noreferrer"
          className="btn-secondary mt-4 inline-flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          github.com/panagot/arc20-conformance-kit
        </a>
      </Panel>
    </div>
  );
}
