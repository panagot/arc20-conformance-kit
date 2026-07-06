import { useOutletContext } from "react-router-dom";

export interface ShellContext {
  apiOnline: boolean;
  apiReady: boolean;
}

export function useShellContext(): ShellContext {
  return useOutletContext<ShellContext>();
}
