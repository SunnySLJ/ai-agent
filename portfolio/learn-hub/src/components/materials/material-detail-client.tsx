"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, Pencil, Save, Loader2, Trash2 } from "lucide-react";
import { NoteViewer } from "@/components/notes/note-viewer";
import { cn } from "@/lib/utils";

type MaterialData = {
  id: string;
  title: string;
  content: string;
  week: string | null;
  category: string | null;
  source: string | null;
};

export function MaterialDetailClient({ materialId }: { materialId: string }) {
  const router = useRouter();
  const [data, setData] = useState<MaterialData | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/materials/${materialId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("资料不存在");
        return r.json();
      })
      .then((d: MaterialData) => {
        setData(d);
        setTitle(d.title);
        setContent(d.content);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [materialId]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(`/api/materials/${materialId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error("保存失败");
      const d = await res.json();
      setData(d);
      setMode("view");
      setSaveMsg("已保存到数据库");
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("确定删除这份资料？此操作不可恢复。")) return;
    const res = await fetch(`/api/materials/${materialId}`, { method: "DELETE" });
    if (res.ok) router.push("/materials");
    else setError("删除失败");
  }

  const dirty = data && (title !== data.title || content !== data.content);

  if (loading) {
    return (
      <div className="card mt-8 p-8 text-center text-sm text-[var(--color-text-muted)]">
        加载中…
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="card mt-8 p-8 text-center text-sm text-[var(--color-lint-error)]">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="section-pad px-6 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/materials"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        >
          <ArrowLeft size={14} />
          返回资料列表
        </Link>

        <header className="mb-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2 text-xs text-[var(--color-text-muted)]">
              {data.week && (
                <span className="rounded-md bg-[var(--color-bg-elev)] px-2 py-0.5">
                  {data.week}
                </span>
              )}
              <span className="rounded-md bg-[var(--color-brand-500)]/10 px-2 py-0.5 text-[var(--color-brand-400)]">
                学习资料
              </span>
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
            <h1 className="text-2xl font-semibold tracking-tight">{data.title}</h1>
          )}

          {data.source && (
            <p className="mt-1 text-xs text-[var(--color-text-subtle)]">
              来源：{data.source}
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
            <NoteViewer content={data.content} />
          </div>
        )}

        {saveMsg && (
          <p className="mt-3 text-xs text-[var(--color-lint-ok)]">{saveMsg}</p>
        )}
      </div>
    </div>
  );
}
