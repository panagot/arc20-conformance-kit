import { useEffect, useRef, type RefObject } from "react";

export function useAssistantPanel(
  open: boolean,
  onClose: () => void,
  fabRef?: RefObject<HTMLButtonElement | null>,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      fabRef?.current?.focus();
    };
  }, [open, onClose, fabRef]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  });

  return { inputRef, messagesRef, panelRef };
}

export function getQuickChips(hasReport: boolean, apiOnline: boolean) {
  if (!apiOnline) {
    return ["API offline help", "What is IARC20?", "ABI vs program check?"];
  }
  if (hasReport) {
    return [
      "Why did I fail?",
      "Which vectors missing?",
      "Export for CI",
      "ABI vs program check?",
    ];
  }
  return [
    "How do I check my token?",
    "ABI vs program check?",
    "What are vectors?",
    "Run demo",
  ];
}
