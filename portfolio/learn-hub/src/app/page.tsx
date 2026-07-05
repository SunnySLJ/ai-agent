"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
  GraduationCap,
  MessageSquare,
  Map,
  ListChecks,
  Calendar,
} from "lucide-react";
import {
  WEEKS,
  DAILY_MINIMUM,
  getCurrentWeek,
  CATEGORIES,
  type CategoryId,
} from "@/lib/curriculum/catalog";

type Note = {
  id: string;
  title: string;
  week: string | null;
  tags: string[];
  created_at: string;
};

type ProgressItem = {
  id: string;
  week: string;
  title: string;
  status: string;
};

type LearningStep = {
  id: string;
  week: string;
  step_order: number;
  title: string;
  status: string;
  deliverable: string | null;
};

const QUICK_LINKS = [
  { href: "/roadmap", label: "学习步骤", icon: ListChecks },
  { href: "/notes", label: "笔记", icon: BookOpen },
  { href: "/review", label: "复习闪卡", icon: Brain },
  { href: "/chat", label: "AI 提问", icon: MessageSquare },
  { href: "/interview", label: "面试题库", icon: GraduationCap },
] as const;

export default function DashboardPage() {
  const [latestNote, setLatestNote] = useState<Note | null>(null);
  const [pendingCards, setPendingCards] = useState(0);
  const [interviewPercent, setInterviewPercent] = useState(0);
  const [interviewLabel, setInterviewLabel] = useState("0/0");
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
  const [weekSteps, setWeekSteps] = useState<LearningStep[]>([]);
  const [loading, setLoading] = useState(true);

  const currentWeek = useMemo(
    () => getCurrentWeek(progressItems),
    [progressItems]
  );

  const todayPack = DAILY_MINIMUM[new Date().getDay()];

  const nextSteps = useMemo(
    () =>
      weekSteps
        .filter((s) => s.status !== "done")
        .sort((a, b) => a.step_order - b.step_order)
        .slice(0, 3),
    [weekSteps]
  );

  useEffect(() => {
    Promise.all([
      fetch("/api/notes").then((r) => r.json()),
      fetch("/api/cards?mastered=0").then((r) => r.json()),
      fetch("/api/interview").then((r) => r.json()),
      fetch("/api/progress").then((r) => r.json()),
      fetch(`/api/steps?week=${currentWeek}`).then((r) => r.json()),
    ])
      .then(([notesData, cardsData, interviewData, progressData, stepsData]) => {
        const notes = (notesData.notes ?? []) as Note[];
        setLatestNote(notes[0] ?? null);
        setPendingCards((cardsData.cards ?? []).length);
        const prog = interviewData.progress ?? { mastered: 0, total: 0 };
        setInterviewPercent(
          prog.total > 0
            ? Math.round((prog.mastered / prog.total) * 100)
            : 0
        );
        setInterviewLabel(`${prog.mastered}/${prog.total}`);
        setProgressItems(progressData.items ?? []);
        setWeekSteps(stepsData.steps ?? []);
      })
      .finally(() => setLoading(false));
  }, [currentWeek]);

  return (
    <div className="section-pad px-6 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold tracking-tight">今日学习</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          {currentWeek} · {WEEKS[currentWeek].theme}
        </p>

        <div className="card mt-6 p-5">
          <div className="flex items-center gap-2 text-xs text-[var(--color-brand-400)]">
            <Calendar size={14} />
            {todayPack.day} · 忙时最小包（45min）
          </div>
          <p className="mt-2 text-sm font-medium">{todayPack.focus}</p>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            课程：{todayPack.course} · 动作：{todayPack.action}
          </p>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
              {currentWeek} 接下来 3 步
            </p>
            <Link
              href="/roadmap"
              className="text-xs text-[var(--color-brand-400)] hover:underline"
            >
              全部步骤 <ArrowRight size={12} className="inline" />
            </Link>
          </div>
          {loading ? (
            <div className="card p-4 text-sm text-[var(--color-text-muted)]">
              加载中…
            </div>
          ) : nextSteps.length === 0 ? (
            <div className="card p-4 text-sm text-[var(--color-text-muted)]">
              本周步骤已全部完成 🎉
            </div>
          ) : (
            <ol className="space-y-2">
              {nextSteps.map((step) => (
                <li key={step.id} className="card flex gap-3 p-4">
                  <span className="font-mono text-xs text-[var(--color-brand-400)]">
                    {step.step_order}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{step.title}</p>
                    {step.deliverable && (
                      <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                        产出：{step.deliverable}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
              最新笔记
            </p>
            {loading ? (
              <p className="mt-2 font-mono text-2xl font-semibold">—</p>
            ) : latestNote ? (
              <>
                <Link
                  href={`/notes/${latestNote.id}`}
                  className="mt-2 block text-sm font-medium text-[var(--color-brand-400)] hover:underline"
                >
                  {latestNote.title}
                </Link>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {latestNote.week ?? "未分类"}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                暂无笔记
              </p>
            )}
          </div>

          <div className="card p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
              待复习闪卡
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold">
              {loading ? "—" : pendingCards}
            </p>
            <Link
              href="/review"
              className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--color-brand-400)] hover:underline"
            >
              去复习 <ArrowRight size={12} />
            </Link>
          </div>

          <div className="card p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
              面试掌握率
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold">
              {loading ? "—" : `${interviewPercent}%`}
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {loading ? "" : interviewLabel}
            </p>
          </div>

          <div className="card p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
              当前周
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold">
              {loading ? "—" : currentWeek}
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {loading ? "" : WEEKS[currentWeek].theme}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-3 text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
            快捷入口
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="card flex items-center gap-3 p-4 transition-colors hover:border-[var(--color-border-strong)]"
                >
                  <Icon size={18} className="text-[var(--color-brand-400)]" />
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-3 text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
            六大学习模块
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {(
              Object.entries(CATEGORIES) as [
                CategoryId,
                (typeof CATEGORIES)[CategoryId],
              ][]
            ).map(([id, cat]) => (
              <Link
                key={id}
                href={`/roadmap`}
                className="card p-3 text-xs transition-colors hover:border-[var(--color-border-strong)]"
              >
                <span style={{ color: cat.color }} className="font-medium">
                  {cat.label}
                </span>
                <p className="mt-0.5 text-[var(--color-text-muted)]">
                  {cat.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
