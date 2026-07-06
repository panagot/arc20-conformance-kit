import { Outlet } from "react-router-dom";

import { AssistantFAB } from "../components/assistant/AssistantFAB";
import { SiteFooter } from "../components/layout/SiteFooter";
import { TopNav } from "../components/layout/TopNav";

export function AppShell({
  apiOnline,
  apiReady,
}: {
  apiOnline: boolean;
  apiReady: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav apiOnline={apiOnline} apiReady={apiReady} />
      <main
        id="main-content"
        className="mx-auto w-full max-w-[1280px] flex-1 px-5 py-8 lg:px-8"
      >
        {apiReady && !apiOnline ? (
          <div
            className="mb-6 rounded-[4px] border border-[color:var(--warn)]/35 bg-[color:var(--warn)]/8 px-4 py-3 text-sm text-[color:var(--warn)]"
            role="alert"
          >
            API offline — start with <code>npm run dev:web</code> (port 8787).
            Checks are disabled until the API is reachable.
          </div>
        ) : null}
        <Outlet context={{ apiOnline, apiReady }} />
      </main>
      <SiteFooter />
      <AssistantFAB apiOnline={apiOnline} />
    </div>
  );
}
