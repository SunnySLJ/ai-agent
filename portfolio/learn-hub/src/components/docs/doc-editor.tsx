"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Pencil, Save, Loader2 } from "lucide-react";
import { NoteViewer } from "@/components/notes/note-viewer";
import { cn } from "@/lib/utils";

type DocEditorProps = {
  filePath: string;
  backHref?: string;
  backLabel?: string;
};

export function DocEditor({
  filePath,
  backHref = "/docs",
  backLabel = "返回文档列表",
}: DocEditorProps) {
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const [editable, setEditable] = useState(false);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/docs/file?path=${encodeURIComponent(filePath)}`)
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json();
          throw new Error(data.error ?? "加载失败");
        }
        return r.json();
      })
      .then((data) => {
        setContent(data.content);
        setSavedContent(data.content);
        setEditable(!!data.editable);
        setMode(data.editable ? "edit" : "view");
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filePath]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/docs/file", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: filePath, content }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "保存失败");
      }
      setSavedContent(content);
      setSaveMsg("已保存到本地文件");
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  const dirty = content !== savedContent;

  return (
    <div className="section-pad px-6 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href={backHref}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        >
          <ArrowLeft size={14} />
          {backLabel}
        </Link>

        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-mono text-lg font-semibold tracking-tight">
              {filePath}
            </h1>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {editable
                ? "可编辑 · 保存后写入项目目录"
                : "只读"}
            </p>
          </div>
          {editable && (
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
              <button
                type="button"
                disabled={!dirty || saving}
                onClick={save}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors",
                  dirty
                    ? "border-[var(--color-brand-500)] text-[var(--color-brand-400)] hover:bg-[var(--color-bg-hover)]"
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
            </div>
          )}
        </header>

        {loading && (
          <div className="card p-8 text-center text-sm text-[var(--color-text-muted)]">
            加载中…
          </div>
        )}

        {error && !loading && (
          <div className="card border-[var(--color-lint-error)] p-6 text-sm text-[var(--color-lint-error)]">
            {error}
          </div>
        )}

        {!loading && !error && mode === "edit" && editable && (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="card min-h-[60vh] w-full resize-y bg-[var(--color-bg-elev)] p-4 font-mono text-sm leading-relaxed text-[var(--color-text-primary)] outline-none focus:ring-1 focus:ring-[var(--color-brand-500)]"
            spellCheck={false}
          />
        )}

        {!loading && !error && (mode === "view" || !editable) && (
          <div className="card p-6 sm:p-8">
            <NoteViewer content={content} />
          </div>
        )}

        {saveMsg && (
          <p className="mt-3 text-xs text-[var(--color-lint-ok)]">{saveMsg}</p>
        )}
        {dirty && (
          <p className="mt-2 text-xs text-[var(--color-lint-warn)]">
            有未保存的修改
          </p>
        )}
      </div>
    </div>
  );
}
