import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[color:var(--border)] bg-[color:var(--panel)]">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-5 py-10 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="font-display text-sm font-semibold tracking-[0.06em]">
            ARC-20 Conformance Kit
          </div>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[color:var(--muted)]">
            Open-source IARC20 QA for Aleo Leo token programs. Built for wallet teams,
            DeFi integrators, and token issuers verifying dynamic dispatch compatibility.
          </p>
        </div>

        <div>
          <div className="font-display text-[11px] uppercase tracking-[0.14em] text-[color:var(--muted)]">
            Reference
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="https://github.com/ProvableHQ/ARCs/blob/master/arc-0020/README.md" target="_blank" rel="noreferrer">ARC-20 Spec</a></li>
            <li><a href="https://docs.provable.com/docs/api/v2/intro" target="_blank" rel="noreferrer">Provable API</a></li>
            <li><a href="https://github.com/panagot/arc20-conformance-kit" target="_blank" rel="noreferrer">GitHub</a></li>
          </ul>
        </div>

        <div>
          <div className="font-display text-[11px] uppercase tracking-[0.14em] text-[color:var(--muted)]">
            Tool
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/about">About</Link></li>
            <li><Link to="/proposal">Project proposal</Link></li>
            <li><Link to="/spec">IARC20 Spec Browser</Link></li>
            <li><Link to="/vectors">Test Vectors</Link></li>
            <li><a href="https://github.com/panagot/arc20-conformance-kit/blob/main/docs/INTEGRATOR_GUIDE.md" target="_blank" rel="noreferrer">Integrator guide</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[color:var(--border)] px-5 py-4 lg:px-8">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 text-xs text-[color:var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>MIT License · panagot · Open-source Aleo tooling · v0.3</span>
          <span>IARC20 conformance workstation</span>
        </div>
      </div>
    </footer>
  );
}
