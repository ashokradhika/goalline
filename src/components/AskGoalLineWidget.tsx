"use client";

import { useRef, useState } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function AskGoalLineWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: accumulated };
          return copy;
        });
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: "Sorry — I couldn't reach GoalLine AI just now. Try again in a moment.",
        };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="fade-up mb-3 flex h-[28rem] w-[22rem] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl sm:w-96">
          <div className="gradient-accent flex items-center justify-between px-4 py-3 text-white">
            <div>
              <p className="text-sm font-bold">Ask GoalLine</p>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
                ✨ AI assistant
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-1 hover:bg-white/20"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-sm text-muted">
                Ask things like &ldquo;Who&rsquo;s leading Group C?&rdquo; or &ldquo;Does Japan
                still have a chance to qualify?&rdquo;
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-accent text-white"
                    : "bg-foreground/5 text-foreground"
                }`}
              >
                {m.content || (loading && i === messages.length - 1 ? "…" : "")}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about standings, scores..."
              className="flex-1 rounded-full border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
            />
            <button
              onClick={send}
              disabled={loading}
              className="gradient-accent rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="gradient-accent relative flex h-14 w-14 items-center justify-center rounded-full text-xl text-white shadow-[0_8px_24px_-6px_rgba(37,99,235,0.5)] transition hover:scale-105"
        aria-label="Open Ask GoalLine chat"
      >
        {!open && (
          <span className="gradient-accent absolute inset-0 -z-10 animate-ping rounded-full opacity-30" />
        )}
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
