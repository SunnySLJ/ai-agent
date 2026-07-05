"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  FileText,
  FolderOpen,
  Notebook,
} from "lucide-react";
import { NoteViewer } from "@/components/notes/note-viewer";
import { coursePathToHref } from "@/lib/docs/urls";

type BrowseEntry = {
  name: string;
  relativePath: string;
  kind: "directory" | "markdown" | "notebook" | "pdf" | "other";
};

type CourseData =
  | { mode: "browse"; path: string; entries: BrowseEntry[] }
  | { mode: "content"; path: string; content: string; fileType: string };

type CourseReaderProps = {
  coursePath: string;
};

const KIND_ICON = {
  directory: FolderOpen,
  markdown: FileText,
  notebook: Notebook,
  pdf: FileText,
  other: FileText,
} as const;

const KIND_LABEL = {
  directory: "文件夹",
  markdown: "Markdown",
  notebook: "Notebook",
  pdf: "PDF",
  other: "文件",
} as const;

export function CourseReader({ coursePath }: CourseReaderProps) {
  const [data, setData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const slug = coursePath.split("/").map(encodeURIComponent).join("/");
    fetch(`/api/course/${slug}`)
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json();
          throw new Error(body.error ?? "加载失败");
        }
        return r.json();
      })
      .then((d: CourseData) => setData(d))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [coursePath]);

  useEffect(() => {
    load();
  }, [load]);

  const crumbs = coursePath.split("/").filter(Boolean);

  return (
    <div className="section-pad px-6 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/roadmap"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        >
          <ArrowLeft size={14} />
          返回学习路线
        </Link>

        <header className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <BookOpen size={14} />
            课程资料（只读）· 来自本地 agent/
          </div>
          <nav className="flex flex-wrap items-center gap-1 text-xs text-[var(--color-text-muted)]">
            <Link href="/course" className="hover:text-[var(--color-brand-400)]">
              agent
            </Link>
            {crumbs.map((part, i) => {
              const subPath = crumbs.slice(0, i + 1).join("/");
              const isLast = i === crumbs.length - 1;
              return (
                <span key={subPath} className="flex items-center gap-1">
                  <ChevronRight size={12} />
                  {isLast ? (
                    <span className="text-[var(--color-text-primary)]">
                      {decodeURIComponent(part)}
                    </span>
                  ) : (
                    <Link
                      href={coursePathToHref(subPath)}
                      className="hover:text-[var(--color-brand-400)]"
                    >
                      {decodeURIComponent(part)}
                    </Link>
                  )}
                </span>
              );
            })}
          </nav>
        </header>

        {loading && (
          <div className="card p-8 text-center text-sm text-[var(--color-text-muted)]">
            加载中…
          </div>
        )}

        {error && (
          <div className="card p-6 text-sm text-[var(--color-lint-error)]">
            {error}
          </div>
        )}

        {!loading && !error && data?.mode === "browse" && (
          <div className="card divide-y divide-[var(--color-border)]">
            {data.entries.length === 0 ? (
              <p className="p-6 text-sm text-[var(--color-text-muted)]">
                此目录为空
              </p>
            ) : (
              data.entries.map((entry) => {
                const Icon = KIND_ICON[entry.kind] ?? FileText;
                const href = coursePathToHref(entry.relativePath);
                return (
                  <Link
                    key={entry.relativePath}
                    href={href}
                    className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[var(--color-bg-hover)]"
                  >
                    <Icon
                      size={16}
                      className={
                        entry.kind === "directory"
                          ? "text-[var(--color-brand-400)]"
                          : "text-[var(--color-text-muted)]"
                      }
                    />
                    <span className="min-w-0 flex-1 truncate">{entry.name}</span>
                    <span className="text-[10px] text-[var(--color-text-subtle)]">
                      {KIND_LABEL[entry.kind] ?? "文件"}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        )}

        {!loading && !error && data?.mode === "content" && (
          <div className="card p-6 sm:p-8">
            {data.fileType === "notebook" && (
              <p className="mb-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
                📓 Notebook 预览（Markdown 单元格）。完整代码单元格请在 Cursor 中打开原文件。
              </p>
            )}
            <NoteViewer content={data.content} />
          </div>
        )}
      </div>
    </div>
  );
}
