"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Citation = {
  chunkId: string;
  noteId?: string;
  noteTitle?: string;
  excerpt: string;
  score: number;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
};

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
      });

      if (!res.ok) throw new Error("Chat request failed");

      const data = (await res.json()) as {
        sessionId: string;
        message: Message & { citations?: Citation[] };
      };

      setSessionId(data.sessionId);
      setMessages((prev) => [
        ...prev,
        {
          id: data.message.id,
          role: "assistant",
          content: data.message.content,
          citations: data.message.citations,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "请求失败，请稍后重试。",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card flex min-h-[520px] flex-col overflow-hidden">
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.length === 0 && (
          <p className="text-center text-sm text-[var(--color-text-muted)]">
            基于所有已学笔记提问，例如：「什么是 RRF？」
          </p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-[var(--color-brand-500)] text-black"
                  : "border border-[var(--color-border)] bg-[var(--color-bg-elev)] text-[var(--color-text-secondary)]"
              )}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 border-t border-[var(--color-border)] pt-2">
                  <p className="mb-1 text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                    引用笔记
                  </p>
                  <ul className="space-y-1">
                    {msg.citations.map((c, i) => (
                      <li
                        key={c.chunkId}
                        className="text-xs text-[var(--color-text-muted)]"
                      >
                        [{i + 1}] {c.noteTitle ?? "笔记"} — {c.excerpt}…
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <Loader2 size={14} className="animate-spin" />
            检索笔记并生成回答…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="flex gap-2 border-t border-[var(--color-border)] p-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入你的问题…"
          className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3 py-2 text-sm outline-none focus:border-[var(--color-brand-500)]"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-brand flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm disabled:opacity-50"
        >
          <Send size={14} />
          发送
        </button>
      </form>
    </div>
  );
}
