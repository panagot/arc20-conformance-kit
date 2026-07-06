import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "./AppShell";
import { AboutPage } from "../pages/AboutPage";
import { AbiCheckPage } from "../pages/AbiCheckPage";
import { OverviewPage } from "../pages/OverviewPage";
import { ProgramCheckPage } from "../pages/ProgramCheckPage";
import { ReportPage } from "../pages/ReportPage";
import { SpecPage } from "../pages/SpecPage";
import { VectorsPage } from "../pages/VectorsPage";

export function AppRouter({
  apiOnline,
  apiReady,
}: {
  apiOnline: boolean;
  apiReady: boolean;
}) {
  return (
    <Routes>
      <Route
        element={<AppShell apiOnline={apiOnline} apiReady={apiReady} />}
      >
        <Route index element={<OverviewPage />} />
        <Route path="check/abi" element={<AbiCheckPage />} />
        <Route path="check/program" element={<ProgramCheckPage />} />
        <Route path="report" element={<ReportPage />} />
        <Route path="spec" element={<SpecPage />} />
        <Route path="vectors" element={<VectorsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
