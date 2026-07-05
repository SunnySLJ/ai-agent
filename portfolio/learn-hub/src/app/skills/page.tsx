"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Library,
  RefreshCw,
  Plus,
  ExternalLink,
  Circle,
} from "lucide-react";

type StudioStatus = { online: boolean; url: string };

const ENTRIES = [
  {
    title: "制作 Skill",
    desc: "从模板或描述生成新 skill，浏览本地 skill 库",
    href: "/skill-studio/library",
    icon: Plus,
    color: "hsl(158 80% 45%)",
  },
  {
    title: "升级 Skill",
    desc: "演化剧场：复盘任务经验，审查并升级已有 skill",
    href: "/skill-studio/evolve/theater",
    icon: RefreshCw,
    color: "hsl(258 70% 65%)",
  },
  {
    title: "Skill 工作台",
    desc: "Project Launch Pad、命令生成与 skill 管理入口",
    href: "/skill-studio/",
    icon: Sparkles,
    color: "hsl(195 85% 55%)",
  },
] as const;

export default function SkillsPage() {
  const [status, setStatus] = useState<StudioStatus | null>(null);

  useEffect(() => {
    fetch("/api/skill-studio/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ online: false, url: "http://127.0.0.1:3270" }));
  }, []);

  return (
    <div className="section-pad px-6 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight">Skill 工坊</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          制作与升级 Cursor/Codex skills · 基于 shuang-skill / Skill Studio
        </p>

        <div className="card mt-6 flex items-center gap-3 px-4 py-3 text-sm">
          <Circle
            size={10}
            className={
              status?.online
                ? "fill-[var(--color-lint-ok)] text-[var(--color-lint-ok)]"
                : "fill-[var(--color-lint-warn)] text-[var(--color-lint-warn)]"
            }
          />
          {status === null ? (
            <span className="text-[var(--color-text-muted)]">检测中…</span>
          ) : status.online ? (
            <span className="text-[var(--color-lint-ok)]">
              Skill Studio 已运行（:3270）
            </span>
          ) : (
            <span className="text-[var(--color-lint-warn)]">
              Skill Studio 未启动 — 请在终端运行：
              <code className="ml-1 text-xs">./start-skill-studio.sh</code>
              或{" "}
              <code className="text-xs">./start-learn.sh --with-skills</code>
            </span>
          )}
        </div>

        <div className="mt-6 grid gap-4">
          {ENTRIES.map((entry) => {
            const Icon = entry.icon;
            return (
              <Link
                key={entry.href}
                href={entry.href}
                target={status?.online ? "_self" : "_blank"}
                className="card block p-5 transition-colors hover:border-[var(--color-brand-500)]/40"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: `color-mix(in srgb, ${entry.color} 15%, transparent)`,
                    }}
                  >
                    <Icon size={18} style={{ color: entry.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-medium">{entry.title}</h2>
                      <ExternalLink
                        size={12}
                        className="text-[var(--color-text-subtle)]"
                      />
                    </div>
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                      {entry.desc}
                    </p>
                    <p className="mt-2 font-mono text-[10px] text-[var(--color-brand-400)]">
                      {entry.href}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <section className="card mt-8 p-5 text-xs text-[var(--color-text-secondary)]">
          <h3 className="mb-2 text-sm font-medium text-[var(--color-text-primary)]">
            命令行升级（任务复盘后）
          </h3>
          <pre className="overflow-x-auto rounded-lg bg-[var(--color-bg-elev)] p-3 font-mono text-[10px] leading-relaxed">
{`cd work/ai-agent
node scripts/create-evolution-note.mjs --title "本次任务经验"
node scripts/evolution-review.mjs --json
node scripts/shuang-skill-manager.mjs sync-back --apply`}
          </pre>
        </section>
      </div>
    </div>
  );
}
