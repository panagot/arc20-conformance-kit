import { Download, FileText } from "lucide-react";
import { Link } from "react-router-dom";

import { PageToolbar, Panel } from "../components/layout/PageToolbar";
import { usePageTitle } from "../hooks/usePageTitle";

export function ProposalPage() {
  usePageTitle("Proposal");

  return (
    <div>
      <PageToolbar
        eyebrow="Documentation"
        title="Project proposal"
        description="Aleo SCALE grant proposal for ARC-20 Conformance Kit — scope, milestones, and ecosystem impact."
      />

      <Panel title="Grant proposal (PDF)">
        <p className="text-sm leading-relaxed text-[color:var(--muted)]">
          Full proposal document for reviewers: project overview, team background, system design,
          funding milestones ($5,000 · 8 weeks), and prototype status.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/arc20-grant-proposal.pdf"
            target="_blank"
            rel="noreferrer"
            className="btn-primary inline-flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Open PDF
          </a>
          <a
            href="/arc20-grant-proposal.pdf"
            download="ARC-20-Conformance-Kit-Grant-Proposal.pdf"
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </a>
          <Link to="/about" className="btn-secondary inline-flex items-center gap-2">
            About the tool
          </Link>
        </div>
      </Panel>

      <div className="mt-4 overflow-hidden rounded-[4px] border border-[color:var(--border)] bg-[color:var(--panel)]">
        <iframe
          src="/arc20-grant-proposal.pdf"
          title="ARC-20 Conformance Kit grant proposal"
          className="h-[min(78vh,920px)] w-full"
        />
      </div>
    </div>
  );
}
