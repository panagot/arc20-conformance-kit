import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ToastTone = "info" | "success" | "error";

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  pushToast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="toast-stack pointer-events-none fixed z-[60] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-[4px] border px-4 py-3 text-sm shadow-lg backdrop-blur-sm ${
              toast.tone === "success"
                ? "border-[color:var(--pass)]/35 bg-[color:var(--panel)]/95 text-[color:var(--pass)]"
                : toast.tone === "error"
                  ? "border-[color:var(--fail)]/35 bg-[color:var(--panel)]/95 text-[color:var(--fail)]"
                  : "border-[color:var(--border)] bg-[color:var(--panel)]/95 text-[color:var(--text)]"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
