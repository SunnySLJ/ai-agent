"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type InterviewQuestion = {
  id: string;
  topic: string;
  question: string;
  answer: string;
  difficulty: string;
  mastered: number;
};

const TOPIC_CHIPS = ["全部", "RAG", "Agent", "Eval", "LangGraph", "ProjectForge"];

export default function InterviewPage() {
  const [topic, setTopic] = useState("全部");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [progress, setProgress] = useState({ mastered: 0, total: 0 });
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const loadQuestions = useCallback(() => {
    setLoading(true);
    const query = topic === "全部" ? "" : `?topic=${encodeURIComponent(topic)}`;
    fetch(`/api/interview${query}`)
      .then((r) => r.json())
      .then(
        (data: {
          questions: InterviewQuestion[];
          progress: { mastered: number; total: number };
        }) => {
          setQuestions(data.questions ?? []);
          setProgress(data.progress ?? { mastered: 0, total: 0 });
        }
      )
      .finally(() => setLoading(false));
  }, [topic]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function toggleMastered(q: InterviewQuestion) {
    const mastered = q.mastered === 1 ? 0 : 1;
    await fetch(`/api/interview/${q.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mastered }),
    });
    loadQuestions();
  }

  const percent =
    progress.total > 0
      ? Math.round((progress.mastered / progress.total) * 100)
      : 0;

  return (
    <div className="section-pad px-6 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold tracking-tight">面试题库</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          按主题筛选，点击展开答案，跟踪掌握进度
        </p>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-[var(--color-text-muted)]">掌握进度</span>
            <span className="font-mono text-[var(--color-brand-400)]">
              {progress.mastered}/{progress.total} ({percent}%)
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-elev)]">
            <div
              className="h-full rounded-full bg-[var(--color-brand-500)] transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {TOPIC_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setTopic(chip)}
              className={cn(
                "rounded-full px-3 py-1 text-xs transition-colors",
                topic === chip
                  ? "bg-[var(--color-brand-500)] text-black"
                  : "border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)]"
              )}
            >
              {chip}
            </button>
          ))}
        </div>

        {loading && (
          <div className="card mt-8 p-8 text-center text-sm text-[var(--color-text-muted)]">
            加载中…
          </div>
        )}

        {!loading && questions.length === 0 && (
          <div className="card mt-8 p-8 text-center text-sm text-[var(--color-text-muted)]">
            暂无面试题。创建笔记时可勾选 generateInterview 自动生成。
          </div>
        )}

        <div className="mt-6 space-y-3">
          {questions.map((q) => {
            const isOpen = expanded.has(q.id);
            return (
              <div key={q.id} className="card overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleExpand(q.id)}
                  className="flex w-full items-start justify-between gap-3 p-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                      <span className="text-[var(--color-brand-400)]">
                        {q.topic}
                      </span>
                      <span>{q.difficulty}</span>
                      {q.mastered === 1 && (
                        <span className="text-[var(--color-lint-ok)]">
                          已掌握
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {q.question}
                    </p>
                  </div>
                  {isOpen ? (
                    <ChevronUp size={16} className="shrink-0 text-[var(--color-text-muted)]" />
                  ) : (
                    <ChevronDown size={16} className="shrink-0 text-[var(--color-text-muted)]" />
                  )}
                </button>

                {isOpen && (
                  <div className="border-t border-[var(--color-border)] px-4 pb-4 pt-3">
                    <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                      {q.answer}
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleMastered(q)}
                      className={cn(
                        "mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs",
                        q.mastered === 1
                          ? "border border-[var(--color-lint-ok)]/40 text-[var(--color-lint-ok)]"
                          : "btn-ghost"
                      )}
                    >
                      <Check size={12} />
                      {q.mastered === 1 ? "取消掌握" : "标记已掌握"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
