import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useReport } from "../../context/ReportContext";
import { getQuickChips, useAssistantPanel } from "../../hooks/useAssistantPanel";
import { cn } from "../../lib/cn";
import { getAssistantReply, type AssistantReply } from "./assistant-knowledge";

interface Message {
  role: "user" | "assistant";
  content: AssistantReply;
}

export function AssistantFAB({ apiOnline }: { apiOnline: boolean }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: {
        text: "ARC-20 Assistant — ask about IARC20 checks, your report, or how to validate a Leo token.",
        links: [{ label: "How to check", to: "/check/abi" }],
      },
    },
  ]);
  const location = useLocation();
  const { report } = useReport();
  const close = useCallback(() => setOpen(false), []);
  const fabRef = useRef<HTMLButtonElement>(null);
  const { inputRef, messagesRef, panelRef } = useAssistantPanel(open, close, fabRef);
  const chips = getQuickChips(Boolean(report), apiOnline);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const reply = getAssistantReply(trimmed, {
      pathname: location.pathname,
      report,
      apiOnline,
    });
    setMessages((current) => [
      ...current,
      { role: "user", content: { text: trimmed } },
      { role: "assistant", content: reply },
    ]);
    setInput("");
  }

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            role="dialog"
            aria-modal="true"
            aria-label="ARC-20 Assistant"
            className="assistant-panel fixed z-50 flex flex-col overflow-hidden rounded-[6px] border border-[color:var(--border)] bg-[color:var(--panel)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[color:var(--border)] px-4 py-3">
              <div>
                <div className="font-display text-sm font-semibold">ARC-20 Assistant</div>
                <div className="text-[11px] text-[color:var(--muted)]">
                  {apiOnline ? "Online · rule-based help" : "API offline"}
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-[4px] border border-[color:var(--border)] p-1.5"
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-[color:var(--border)] px-3 py-2">
              {chips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  disabled={!apiOnline && chip !== "API offline help"}
                  onClick={() => send(chip)}
                  className="rounded-[4px] border border-[color:var(--border)] px-2 py-1 text-[11px] text-[color:var(--muted)] hover:text-[color:var(--text)] disabled:opacity-40"
                >
                  {chip}
                </button>
              ))}
            </div>

            <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={cn(
                    "max-w-[92%] rounded-[4px] px-3 py-2 text-sm leading-relaxed",
                    message.role === "user"
                      ? "ml-auto bg-[color:var(--accent)]/15 text-[color:var(--text)]"
                      : "bg-[color:var(--panel-2)] text-[color:var(--muted)]",
                  )}
                >
                  <p>{message.content.text}</p>
                  {message.content.links?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.content.links.map((link) =>
                        link.to.startsWith("http") ? (
                          <a
                            key={link.label}
                            href={link.to}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-[color:var(--accent-2)]"
                          >
                            {link.label} →
                          </a>
                        ) : (
                          <Link
                            key={link.label}
                            to={link.to}
                            state={link.state}
                            onClick={close}
                            className="text-[11px] text-[color:var(--accent-2)]"
                          >
                            {link.label} →
                          </Link>
                        ),
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <form
              className="flex gap-2 border-t border-[color:var(--border)] p-3"
              onSubmit={(event) => {
                event.preventDefault();
                send(input);
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about IARC20…"
                className="input-field flex-1"
                aria-label="Assistant message"
              />
              <button
                type="submit"
                className="btn-primary px-3"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!open ? (
        <button
          ref={fabRef}
          type="button"
          onClick={() => setOpen(true)}
          className="assistant-fab fixed z-50 flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--accent)]/50 bg-[color:var(--panel)] shadow-lg transition-transform hover:scale-105"
          aria-label="Open conformance assistant"
        >
          <MessageCircle className="h-5 w-5 text-[color:var(--accent)]" />
        </button>
      ) : null}
    </>
  );
}
