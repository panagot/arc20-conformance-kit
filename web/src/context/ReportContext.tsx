import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { ConformanceReport } from "../types";

const REPORT_KEY = "arc20-last-report";
const META_KEY = "arc20-check-meta";

export type CheckMeta =
  | { kind: "demo" }
  | { kind: "abi"; abi: unknown }
  | { kind: "program"; programId: string; network: "mainnet" | "testnet" };

interface ReportContextValue {
  report: ConformanceReport | null;
  checkMeta: CheckMeta | null;
  setReport: (report: ConformanceReport | null, meta?: CheckMeta | null) => void;
  clearReport: () => void;
}

const ReportContext = createContext<ReportContextValue | null>(null);

function readStored<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function ReportProvider({ children }: { children: ReactNode }) {
  const [report, setReportState] = useState<ConformanceReport | null>(() =>
    readStored(REPORT_KEY),
  );
  const [checkMeta, setCheckMeta] = useState<CheckMeta | null>(() =>
    readStored(META_KEY),
  );

  const setReport = useCallback(
    (next: ConformanceReport | null, meta: CheckMeta | null = null) => {
      setReportState(next);
      setCheckMeta(meta);
      if (next) {
        localStorage.setItem(REPORT_KEY, JSON.stringify(next));
        if (meta) localStorage.setItem(META_KEY, JSON.stringify(meta));
        else localStorage.removeItem(META_KEY);
      } else {
        localStorage.removeItem(REPORT_KEY);
        localStorage.removeItem(META_KEY);
      }
    },
    [],
  );

  const clearReport = useCallback(() => setReport(null, null), [setReport]);

  const value = useMemo(
    () => ({ report, checkMeta, setReport, clearReport }),
    [report, checkMeta, setReport, clearReport],
  );

  return (
    <ReportContext.Provider value={value}>{children}</ReportContext.Provider>
  );
}

export function useReport() {
  const ctx = useContext(ReportContext);
  if (!ctx) throw new Error("useReport must be used within ReportProvider");
  return ctx;
}
