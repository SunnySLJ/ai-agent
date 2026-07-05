"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FlipCard } from "@/components/review/flip-card";

type Card = {
  id: string;
  note_id: string;
  question: string;
  answer: string;
  mastered: number;
};

export default function ReviewPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadCards = useCallback(() => {
    setLoading(true);
    fetch("/api/cards?mastered=0")
      .then((r) => r.json())
      .then((data: { cards: Card[] }) => {
        setCards(data.cards ?? []);
        setIndex(0);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const current = cards[index];

  async function markMastered() {
    if (!current) return;
    await fetch(`/api/cards/${current.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mastered: 1 }),
    });
    const next = cards.filter((c) => c.id !== current.id);
    setCards(next);
    setIndex((i) => Math.min(i, Math.max(0, next.length - 1)));
  }

  return (
    <div className="section-pad px-6 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight">闪卡复习</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          翻转卡片复习，标记已掌握的知识点
        </p>

        {loading && (
          <div className="card mt-8 flex min-h-[280px] items-center justify-center p-8 text-sm text-[var(--color-text-muted)]">
            加载中…
          </div>
        )}

        {!loading && cards.length === 0 && (
          <div className="card mt-8 flex min-h-[280px] items-center justify-center p-8 text-sm text-[var(--color-text-muted)]">
            暂无待复习闪卡。创建笔记时可勾选 generateCards 自动生成。
          </div>
        )}

        {!loading && current && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
              <span>
                {index + 1} / {cards.length} 张待复习
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  disabled={index === 0}
                  className="btn-ghost rounded-lg p-2 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setIndex((i) => Math.min(cards.length - 1, i + 1))
                  }
                  disabled={index >= cards.length - 1}
                  className="btn-ghost rounded-lg p-2 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <FlipCard question={current.question} answer={current.answer} />

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={markMastered}
                className="btn-brand rounded-lg px-5 py-2 text-sm"
              >
                掌握了
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
