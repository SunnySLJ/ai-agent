"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CATEGORIES,
  WEEKS,
  type CategoryId,
  type WeekId,
} from "@/lib/curriculum/catalog";

type Note = {
  id: string;
  title: string;
  week: string | null;
  tags: string[];
  created_at: string;
};

function inferCategory(tags: string[]): CategoryId | "other" {
  const lower = tags.map((t) => t.toLowerCase());
  if (lower.some((t) => ["rag", "part05", "查证", "claim"].includes(t)))
    return "rag";
  if (lower.some((t) => ["agent", "langgraph", "forge", "part04", "part14"].includes(t)))
    return "agent";
  if (lower.some((t) => ["eval", "part13", "评估"].includes(t)))
    return "eval";
  if (lower.some((t) => ["harness", "fastapi", "mcp", "part10", "part19"].includes(t)))
    return "engineering";
  if (lower.some((t) => ["docker", "deploy", "part12"].includes(t)))
    return "deploy";
  if (lower.some((t) => ["portfolio", "projectforge"].includes(t)))
    return "portfolio";
  return "other";
}

type FilterMode = "week" | "category";

function NotesPageInner() {
  const searchParams = useSearchParams();
  const weekFromUrl = searchParams.get("week");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<FilterMode>("week");
  const [activeFilter, setActiveFilter] = useState<string>(
    weekFromUrl ?? "all"
  );

  useEffect(() => {
    fetch("/api/notes")
      .then((r) => r.json())
      .then((data: { notes: Note[] }) => setNotes(data.notes ?? []))
      .finally(() => setLoading(false));
  }, []);

  const notesWithMeta = useMemo(
    () =>
      notes.map((n) => ({
        ...n,
        category: inferCategory(n.tags),
      })),
    [notes]
  );

  const grouped = useMemo(() => {
    const map: Record<string, typeof notesWithMeta> = {};
    for (const note of notesWithMeta) {
      const key =
        filterMode === "week"
          ? note.week || "未分周"
          : note.category === "other"
            ? "其他"
            : CATEGORIES[note.category as CategoryId]?.label ?? "其他";
      (map[key] ??= []).push(note);
    }
    return map;
  }, [notesWithMeta, filterMode]);

  const groupKeys = useMemo(() => {
    if (filterMode === "week") {
      const order = ["W1", "W2", "W3", "W4", "W5", "W6", "未分周"];
      return Object.keys(grouped).sort(
        (a, b) => order.indexOf(a) - order.indexOf(b) || a.localeCompare(b)
      );
    }
    return Object.keys(grouped).sort();
  }, [grouped, filterMode]);

  const filters =
    filterMode === "week"
      ? [
          { id: "all", label: "全部" },
          ...(["W1", "W2", "W3", "W4", "W5", "W6"] as WeekId[]).map((w) => ({
            id: w,
            label: `${w} ${WEEKS[w].theme}`,
          })),
        ]
      : [
          { id: "all", label: "全部" },
          ...Object.entries(CATEGORIES).map(([id, c]) => ({
            id,
            label: c.label,
          })),
          { id: "other", label: "其他" },
        ];

  const visibleGroups =
    activeFilter === "all"
      ? groupKeys
      : groupKeys.filter((k) => {
          if (filterMode === "week") return k === activeFilter;
          if (activeFilter === "other") return k === "其他";
          return k === CATEGORIES[activeFilter as CategoryId]?.label;
        });

  return (
    <div className="section-pad px-6 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">学习笔记</h1>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              你的个人笔记 · 支持新建、编辑、删除
            </p>
          </div>
          <Link
            href="/notes/new"
            className="btn-brand flex items-center gap-1.5 px-3 py-2 text-sm"
          >
            + 新建笔记
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setFilterMode("week");
              setActiveFilter("all");
            }}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs transition-colors",
              filterMode === "week"
                ? "bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)]"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]"
            )}
          >
            按周次
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterMode("category");
              setActiveFilter("all");
            }}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs transition-colors",
              filterMode === "category"
                ? "bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)]"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]"
            )}
          >
            按模块
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                "rounded-md border px-2 py-1 text-[10px] transition-colors",
                activeFilter === f.id
                  ? "border-[var(--color-brand-500)]/40 bg-[var(--color-brand-500)]/10 text-[var(--color-brand-400)]"
                  : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="card mt-8 p-8 text-center text-sm text-[var(--color-text-muted)]">
            加载中…
          </div>
        )}

        {!loading && notes.length === 0 && (
          <div className="card mt-8 p-8 text-center text-sm text-[var(--color-text-muted)]">
            暂无笔记。学完课程章节后，Agent 会自动写入。
          </div>
        )}

        <div className="mt-8 space-y-8">
          {visibleGroups.map((group) => (
            <section key={group}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--color-brand-400)]">
                <BookOpen size={14} />
                {group}
                <span className="text-[var(--color-text-muted)]">
                  ({grouped[group]?.length ?? 0})
                </span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {grouped[group]?.map((note) => (
                  <Link
                    key={note.id}
                    href={`/notes/${note.id}`}
                    className="card block p-4 transition-colors hover:border-[var(--color-brand-500)]/40"
                  >
                    <h3 className="font-medium">{note.title}</h3>
                    {note.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-md bg-[var(--color-bg-elev)] px-2 py-0.5 text-[10px] text-[var(--color-text-muted)]"
                          >
                            <Tag size={10} />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="mt-2 text-xs text-[var(--color-text-subtle)]">
                      {new Date(note.created_at).toLocaleDateString("zh-CN")}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense
      fallback={
        <div className="section-pad px-6 p-8 text-sm text-[var(--color-text-muted)]">
          加载中…
        </div>
      }
    >
      <NotesPageInner />
    </Suspense>
  );
}
