import Link from "next/link";
import { BookOpen, FolderOpen } from "lucide-react";
import fs from "fs";
import { getAgentRoot } from "@/lib/docs/fs";
import { coursePathToHref } from "@/lib/docs/urls";

export default function CourseIndexPage() {
  let parts: string[] = [];
  try {
    parts = fs
      .readdirSync(getAgentRoot())
      .filter((d) => d.startsWith("part") && !d.startsWith("."))
      .sort((a, b) => a.localeCompare(b, "zh-CN"));
  } catch {
    parts = [];
  }

  return (
    <div className="section-pad px-6 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight">课程库</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          浏览本地 agent/ 课件 · 支持进入子目录、预览 Markdown 和 Notebook
        </p>

        <ul className="card mt-6 divide-y divide-[var(--color-border)]">
          {parts.map((part) => (
            <li key={part}>
              <Link
                href={coursePathToHref(part)}
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[var(--color-bg-hover)]"
              >
                <FolderOpen size={16} className="text-[var(--color-brand-400)]" />
                <span>{part}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-4 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <BookOpen size={12} />
          也可从学习路线里的「课程：…」链接直接进入对应章节
        </p>
      </div>
    </div>
  );
}
