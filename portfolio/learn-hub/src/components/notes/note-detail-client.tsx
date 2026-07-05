"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, Pencil, Save, Loader2, Trash2 } from "lucide-react";
import { NoteViewer } from "@/components/notes/note-viewer";
import { cn } from "@/lib/utils";

type NoteData = {
  id: string;
  title: string;
  content: string;
  week: string | null;
  tags: string[];
  source: string | null;
};

export function NoteDetailClient({ noteId }: { noteId: string }) {
  const router = useRouter();
  const [note, setNote] = useState<NoteData | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/notes/${noteId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("笔记不存在");
        return r.json();
      })
      .then((data: NoteData) => {
        setNote(data);
        setTitle(data.title);
        setContent(data.content);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [noteId]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "保存失败");
      }
      const data = await res.json();
      setNote(data);
      setTitle(data.title);
      setContent(data.content);
      setMode("view");
      setSaveMsg("已保存（RAG 索引已更新）");
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("确定删除这篇笔记？此操作不可恢复。")) return;
    const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    if (res.ok) router.push("/notes");
    else setError("删除失败");
  }

  const dirty =
    note && (title !== note.title || content !== note.content);

  if (loading) {
    return (
      <div className="card mt-8 p-8 text-center text-sm text-[var(--color-text-muted)]">
        加载中…
      </div>
    );
  }

  if (error && !note) {
    return (
      <div className="card mt-8 p-8 text-center text-sm text-[var(--color-lint-error)]">
        {error}
      </div>
    );
  }

  if (!note) return null;

  return (
    <div className="section-pad px-6 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/notes"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        >
          <ArrowLeft size={14} />
          返回笔记列表
        </Link>

        <header className="mb-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
              {note.week && (
                <span className="rounded-md bg-[var(--color-bg-elev)] px-2 py-0.5">
                  {note.week}
                </span>
              )}
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-[var(--color-bg-elev)] px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode(mode === "view" ? "edit" : "view")}
                className="btn-brand flex items-center gap-1.5 px-3 py-1.5 text-xs"
              >
                {mode === "view" ? (
                  <>
                    <Pencil size={12} /> 编辑
                  </>
                ) : (
                  <>
                    <Eye size={12} /> 预览
                  </>
                )}
              </button>
              {mode === "edit" && (
                <button
                  type="button"
                  disabled={!dirty || saving}
                  onClick={save}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs",
                    dirty
                      ? "border-[var(--color-brand-500)] text-[var(--color-brand-400)]"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)]"
                  )}
                >
                  {saving ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Save size={12} />
                  )}
                  保存
                </button>
              )}
              <button
                type="button"
                onClick={remove}
                className="flex items-center gap-1 rounded-lg border border-[var(--color-lint-error)]/40 px-3 py-1.5 text-xs text-[var(--color-lint-error)] hover:bg-[var(--color-bg-hover)]"
              >
                <Trash2 size={12} />
                删除
              </button>
            </div>
          </div>

          {mode === "edit" ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3 py-2 text-2xl font-semibold outline-none focus:ring-1 focus:ring-[var(--color-brand-500)]"
            />
          ) : (
            <h1 className="text-2xl font-semibold tracking-tight">
              {note.title}
            </h1>
          )}

          {note.source && (
            <p className="mt-1 text-xs text-[var(--color-text-subtle)]">
              来源：{note.source}
            </p>
          )}
        </header>

        {mode === "edit" ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="card min-h-[50vh] w-full resize-y bg-[var(--color-bg-elev)] p-4 font-mono text-sm leading-relaxed outline-none focus:ring-1 focus:ring-[var(--color-brand-500)]"
            spellCheck={false}
          />
        ) : (
          <div className="card p-6 sm:p-8">
            <NoteViewer content={note.content} />
          </div>
        )}

        {saveMsg && (
          <p className="mt-3 text-xs text-[var(--color-lint-ok)]">{saveMsg}</p>
        )}
      </div>
    </div>
  );
}
