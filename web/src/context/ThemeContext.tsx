import { useEffect, type ReactNode } from "react";

import { applyStudioIvoryTheme } from "../themes/studio-ivory";

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    applyStudioIvoryTheme();
  }, []);

  return children;
}
