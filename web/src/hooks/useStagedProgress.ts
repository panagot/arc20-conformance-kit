import { useCallback, useEffect, useRef, useState } from "react";

export function useStagedProgress(steps: string[]) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [active, setActive] = useState(false);
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = useCallback(() => {
    clearTimer();
    setActive(true);
    setProgress(4);
    setStepIndex(0);
    let tick = 4;
    timerRef.current = window.setInterval(() => {
      tick = Math.min(tick + Math.random() * 9 + 2, 92);
      setProgress(Math.round(tick));
      setStepIndex((current) =>
        Math.min(steps.length - 1, Math.floor((tick / 100) * steps.length)),
      );
      if (tick >= 92) clearTimer();
    }, 220);
  }, [steps]);

  const complete = useCallback(() => {
    clearTimer();
    setProgress(100);
    setStepIndex(steps.length - 1);
    window.setTimeout(() => setActive(false), 450);
  }, [steps.length]);

  const reset = useCallback(() => {
    clearTimer();
    setActive(false);
    setProgress(0);
    setStepIndex(0);
  }, []);

  useEffect(() => () => clearTimer(), []);

  return {
    active,
    progress,
    currentStep: steps[stepIndex] ?? steps[0] ?? "",
    start,
    complete,
    reset,
  };
}
