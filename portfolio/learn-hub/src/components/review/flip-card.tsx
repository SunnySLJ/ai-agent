"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type FlipCardProps = {
  question: string;
  answer: string;
  className?: string;
};

export function FlipCard({ question, answer, className }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      className={cn("group w-full perspective-[1200px]", className)}
      aria-label={flipped ? "显示问题" : "显示答案"}
    >
      <div
        className={cn(
          "relative min-h-[240px] w-full transition-transform duration-500 [transform-style:preserve-3d]",
          flipped && "[transform:rotateY(180deg)]"
        )}
      >
        <div
          className={cn(
            "card absolute inset-0 flex items-center justify-center p-8 text-center",
            "[backface-visibility:hidden]"
          )}
        >
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
              问题
            </p>
            <p className="text-lg font-medium text-[var(--color-text-primary)]">
              {question}
            </p>
            <p className="mt-4 text-xs text-[var(--color-text-muted)]">
              点击翻转查看答案
            </p>
          </div>
        </div>

        <div
          className={cn(
            "card absolute inset-0 flex items-center justify-center p-8 text-center",
            "border-[var(--color-brand-500)]/30 bg-[var(--color-bg-elev)]",
            "[backface-visibility:hidden] [transform:rotateY(180deg)]"
          )}
        >
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-wider text-[var(--color-brand-400)]">
              答案
            </p>
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {answer}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}
