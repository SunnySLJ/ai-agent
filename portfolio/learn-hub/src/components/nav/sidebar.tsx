"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Brain,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Map,
  MessageSquare,
  Sparkles,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "首页", icon: LayoutDashboard },
  { href: "/notes", label: "笔记", icon: BookOpen },
  { href: "/materials", label: "资料", icon: FileText },
  { href: "/skills", label: "Skill 工坊", icon: Wand2 },
  { href: "/review", label: "复习", icon: Brain },
  { href: "/chat", label: "AI 提问", icon: MessageSquare },
  { href: "/roadmap", label: "学习路线", icon: Map },
  { href: "/interview", label: "面试题库", icon: GraduationCap },
  { href: "/my-agent", label: "我的 Agent", icon: Sparkles },
] as const;

type SidebarProps = {
  progressPercent?: number;
  progressLabel?: string;
};

export function Sidebar({
  progressPercent = 0,
  progressLabel = "学习进度",
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-panel)]">
      <div className="flex h-14 items-center gap-2 border-b border-[var(--color-border)] px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-elev)]">
          <Sparkles size={14} className="text-[var(--color-brand-400)]" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium tracking-tight">
            AI Learn Hub
          </p>
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
            local
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-[var(--color-bg-hover)] text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
              )}
            >
              <Icon
                size={16}
                className={cn(
                  active
                    ? "text-[var(--color-brand-400)]"
                    : "text-[var(--color-text-subtle)]"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--color-border)] p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-[var(--color-text-muted)]">{progressLabel}</span>
          <span className="font-mono text-[var(--color-brand-400)]">
            {progressPercent}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-elev)]">
          <div
            className="h-full rounded-full bg-[var(--color-brand-500)] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </aside>
  );
}
