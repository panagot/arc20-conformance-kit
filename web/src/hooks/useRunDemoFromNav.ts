import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export function useRunDemoFromNav(runDemo: () => void) {
  const location = useLocation();
  const ranRef = useRef(false);

  useEffect(() => {
    const state = location.state as { runDemo?: boolean } | null;
    if (state?.runDemo && !ranRef.current) {
      ranRef.current = true;
      runDemo();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, runDemo]);
}
