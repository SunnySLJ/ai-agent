"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  CheckCircle2,
  Circle,
  Loader2,
  BookOpen,
  Target,
  ListOrdered,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CATEGORIES,
  WEEKS,
  type CategoryId,
} from "@/lib/curriculum/catalog";
import { ResourceLinks } from "@/components/roadmap/resource-links";
import type { ResourceLink } from "@/lib/docs/resolve-links";
import Link from "next/link";

type LearningStep = {
  id: string;
  week: string;
  step_order: number;
  category: string;
  title: string;
  action: string | null;
  course_part: string | null;
  code_path: string | null;
  deliverable: string | null;
  status: "done" | "learning" | "todo";
  links?: ResourceLink[];
};

type ProgressItem = {
  id: string;
  week: string;
  title: string;
  status: "done" | "learning" | "todo";
  category: string | null;
  course_part: string | null;
  code_path: string | null;
  standard: string | null;
  links?: ResourceLink[];
};

type DeferredCourse = { part: string; name: string; reason: string };

const WEEK_IDS = ["W1", "W2", "W3", "W4", "W5", "W6"] as const;
const STATUS_CYCLE = ["todo", "learning", "done"] as const;
const TABS = [
  { id: "steps", label: "学习步骤", icon: ListOrdered },
  { id: "topics", label: "知识点", icon: Layers },
  { id: "catalog", label: "资料目录", icon: BookOpen },
] as const;

type TabId = (typeof TABS)[number]["id"];

function StatusIcon({
  status,
  size = 16,
}: {
  status: string;
  size?: number;
}) {
  if (status === "done")
    return (
      <CheckCircle2
        size={size}
        className="text-[var(--color-lint-ok)]"
      />
    );
  if (status === "learning")
    return (
      <Loader2
        size={size}
        className="animate-spin text-[var(--color-lint-warn)]"
      />
    );
  return <Circle size={size} className="text-[var(--color-text-subtle)]" />;
}

function CategoryBadge({ category }: { category: string }) {
  const meta = CATEGORIES[category as CategoryId];
  if (!meta) return null;
  return (
    <span
      className="rounded px-1.5 py-0.5 text-[10px]"
      style={{
        background: `color-mix(in srgb, ${meta.color} 12%, transparent)`,
        color: meta.color,
      }}
    >
      {meta.label}
    </span>
  );
}

export default function RoadmapPage() {
  const [tab, setTab] = useState<TabId>("steps");
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [steps, setSteps] = useState<LearningStep[]>([]);
  const [deferred, setDeferred] = useState<DeferredCourse[]>([]);
  const [openWeeks, setOpenWeeks] = useState<Set<string>>(
    new Set(["W1", "W2"])
  );
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/progress").then((r) => r.json()),
      fetch("/api/steps").then((r) => r.json()),
      fetch("/api/curriculum").then((r) => r.json()),
    ])
      .then(([progData, stepsData, currData]) => {
        setProgress(progData.items ?? []);
        setSteps(stepsData.steps ?? []);
        setDeferred(currData.deferred ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stepsByWeek = useMemo(() => {
    const map: Record<string, LearningStep[]> = {};
    for (const w of WEEK_IDS) map[w] = [];
    for (const s of steps) (map[s.week] ??= []).push(s);
    for (const w of WEEK_IDS) {
      map[w]?.sort((a, b) => a.step_order - b.step_order);
    }
    return map;
  }, [steps]);

  const topicsByWeek = useMemo(() => {
    const map: Record<string, ProgressItem[]> = {};
    for (const w of WEEK_IDS) map[w] = [];
    for (const p of progress) (map[p.week] ??= []).push(p);
    return map;
  }, [progress]);

  const doneSteps = steps.filter((s) => s.status === "done").length;
  const doneTopics = progress.filter((p) => p.status === "done").length;

  async function cycleStepStatus(step: LearningStep) {
    const idx = STATUS_CYCLE.indexOf(step.status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]!;
    setUpdatingId(step.id);
    try {
      const res = await fetch("/api/steps", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: step.id, status: next }),
      });
      if (res.ok) {
        const data = await res.json();
        setSteps((prev) =>
          prev.map((s) =>
            s.id === step.id
              ? { ...data.item, links: s.links }
              : s
          )
        );
      }
    } finally {
      setUpdatingId(null);
    }
  }

  async function cycleTopicStatus(item: ProgressItem) {
    const idx = STATUS_CYCLE.indexOf(item.status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]!;
    setUpdatingId(item.id);
    try {
      const res = await fetch("/api/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, status: next }),
      });
      if (res.ok) {
        const data = await res.json();
        setProgress((prev) =>
          prev.map((p) => (p.id === item.id ? data.item : p))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  }

  function toggleWeek(week: string) {
    setOpenWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week);
      else next.add(week);
      return next;
    });
  }

  return (
    <div className="section-pad px-6 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold tracking-tight">学习路线</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          按周执行 · 步骤有序 · 知识点可打勾
        </p>
        <p className="mt-1 font-mono text-xs text-[var(--color-brand-400)]">
          步骤 {doneSteps}/{steps.length} · 知识点 {doneTopics}/{progress.length}
        </p>

        <div className="mt-6 flex gap-1 border-b border-[var(--color-border)]">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition-colors -mb-px",
                  tab === t.id
                    ? "border-[var(--color-brand-500)] text-[var(--color-brand-400)]"
                    : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                )}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="card mt-8 p-8 text-center text-sm text-[var(--color-text-muted)]">
            加载中…
          </div>
        )}

        {!loading && tab === "steps" && (
          <div className="mt-6 space-y-3">
            <p className="text-xs text-[var(--color-text-muted)]">
              每周按序号执行：课程输入 → 代码对照 → 工程产出。点击左侧圆圈切换状态，点击下方链接打开文档。
            </p>
            {WEEK_IDS.map((week) => {
              const weekSteps = stepsByWeek[week] ?? [];
              const weekDone = weekSteps.filter((s) => s.status === "done").length;
              const isOpen = openWeeks.has(week);
              const meta = WEEKS[week];

              return (
                <div key={week} className="card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleWeek(week)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[var(--color-bg-hover)]"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {week} · {meta.theme}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                        {weekDone}/{weekSteps.length} 步完成 · Harness: {meta.harness}
                      </p>
                    </div>
                    <ChevronDown
                      size={16}
                      className={cn(
                        "text-[var(--color-text-muted)] transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {isOpen && (
                    <ol className="border-t border-[var(--color-border)]">
                      {weekSteps.map((step) => (
                        <li
                          key={step.id}
                          className="border-b border-[var(--color-border-soft)] last:border-0"
                        >
                          <div className="flex gap-3 px-4 py-3 hover:bg-[var(--color-bg-hover)]">
                            <span className="mt-0.5 font-mono text-xs text-[var(--color-text-subtle)]">
                              {step.step_order}
                            </span>
                            <button
                              type="button"
                              disabled={updatingId === step.id}
                              onClick={() => cycleStepStatus(step)}
                              className="mt-0.5 shrink-0 disabled:opacity-60"
                              aria-label="切换完成状态"
                            >
                              <StatusIcon status={step.status} />
                            </button>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium">
                                  {step.title}
                                </span>
                                <CategoryBadge category={step.category} />
                              </div>
                              {step.action && (
                                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                                  动作：{step.action}
                                </p>
                              )}
                              {step.deliverable && (
                                <p className="mt-1 text-[10px] text-[var(--color-brand-400)]">
                                  产出：{step.deliverable}
                                </p>
                              )}
                              <ResourceLinks links={step.links ?? []} />
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && tab === "topics" && (
          <div className="mt-6 space-y-3">
            <div className="flex flex-wrap gap-2">
              {Object.entries(CATEGORIES).map(([id, cat]) => {
                const count = progress.filter((p) => p.category === id).length;
                const done = progress.filter(
                  (p) => p.category === id && p.status === "done"
                ).length;
                return (
                  <span
                    key={id}
                    className="card px-3 py-1.5 text-xs"
                    style={{
                      borderColor: `color-mix(in srgb, ${cat.color} 25%, transparent)`,
                    }}
                  >
                    <span style={{ color: cat.color }}>{cat.label}</span>
                    <span className="ml-2 text-[var(--color-text-muted)]">
                      {done}/{count}
                    </span>
                  </span>
                );
              })}
            </div>

            {WEEK_IDS.map((week) => {
              const weekItems = topicsByWeek[week] ?? [];
              const isOpen = openWeeks.has(week);
              return (
                <div key={week} className="card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleWeek(week)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[var(--color-bg-hover)]"
                  >
                    <p className="text-sm font-medium">
                      {week} · {WEEKS[week].theme}
                    </p>
                    <ChevronDown
                      size={16}
                      className={cn(
                        "text-[var(--color-text-muted)] transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                  {isOpen && (
                    <ul className="border-t border-[var(--color-border)]">
                      {weekItems.map((item) => (
                        <li key={item.id}>
                          <div className="flex items-start gap-3 px-4 py-2.5 text-sm hover:bg-[var(--color-bg-hover)]">
                            <button
                              type="button"
                              disabled={updatingId === item.id}
                              onClick={() => cycleTopicStatus(item)}
                              className="mt-0.5 shrink-0 disabled:opacity-60"
                              aria-label="切换完成状态"
                            >
                              <StatusIcon status={item.status} />
                            </button>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span>{item.title}</span>
                                {item.category && (
                                  <CategoryBadge category={item.category} />
                                )}
                              </div>
                              {item.standard && (
                                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                                  标准：{item.standard}
                                </p>
                              )}
                              <ResourceLinks links={item.links ?? []} />
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && tab === "catalog" && (
          <div className="mt-6 space-y-6">
            <section>
              <h2 className="mb-3 text-sm font-medium">六大模块分类</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(CATEGORIES).map(([id, cat]) => (
                  <div key={id} className="card p-4">
                    <p
                      className="text-sm font-medium"
                      style={{ color: cat.color }}
                    >
                      {cat.label}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                      {cat.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-medium">六周主题一览</h2>
              <div className="space-y-2">
                {WEEK_IDS.map((week) => {
                  const m = WEEKS[week];
                  return (
                    <div key={week} className="card p-4 text-xs">
                      <p className="font-medium text-[var(--color-brand-400)]">
                        {week} · {m.theme}
                      </p>
                      <p className="mt-1 text-[var(--color-text-secondary)]">
                        课程：{m.course}
                      </p>
                      <p className="text-[var(--color-text-secondary)]">
                        工程：{m.engineering}
                      </p>
                      <p className="text-[var(--color-text-muted)]">
                        Harness：{m.harness}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Link
                          href="/materials"
                          className="text-[var(--color-brand-400)] hover:underline"
                        >
                          本周资料
                        </Link>
                        <Link
                          href={`/notes?week=${week}`}
                          className="text-[var(--color-brand-400)] hover:underline"
                        >
                          我的笔记
                        </Link>
                        <Link
                          href={`/roadmap`}
                          onClick={(e) => {
                            e.preventDefault();
                            setTab("steps");
                            setOpenWeeks((prev) => new Set(prev).add(week));
                          }}
                          className="text-[var(--color-brand-400)] hover:underline"
                        >
                          本周步骤
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Target size={14} />
                暂缓学习（不必现在啃）
              </h2>
              <ul className="card divide-y divide-[var(--color-border)]">
                {deferred.map((d) => (
                  <li
                    key={d.part}
                    className="flex items-center justify-between px-4 py-2.5 text-xs"
                  >
                    <span>
                      <span className="font-mono text-[var(--color-text-muted)]">
                        {d.part}
                      </span>
                      <span className="ml-2">{d.name}</span>
                    </span>
                    <span className="text-[var(--color-text-subtle)]">
                      {d.reason}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
