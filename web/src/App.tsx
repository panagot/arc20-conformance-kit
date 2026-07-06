import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

import { AppRouter } from "./app/router";
import { ThemeProvider } from "./context/ThemeContext";
import { ReportProvider } from "./context/ReportContext";
import { ToastProvider } from "./context/ToastContext";
import { fetchHealth } from "./api";

const queryClient = new QueryClient();

function AppProviders() {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    retry: 1,
    refetchInterval: 30_000,
  });

  return (
    <ThemeProvider>
      <ReportProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRouter
              apiOnline={health.isSuccess}
              apiReady={health.isFetched}
            />
          </BrowserRouter>
        </ToastProvider>
      </ReportProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProviders />
    </QueryClientProvider>
  );
}
