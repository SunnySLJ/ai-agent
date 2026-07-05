"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

function NewNoteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultWeek = searchParams.get("week") ?? "";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("# \n\n");
  const [week, setWeek] = useState(defaultWeek);
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          week: week || undefined,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          source: "用户自建",
        }),
      });
      if (!res.ok) throw new Error("创建失败");
      const data = await res.json();
      router.push(`/notes/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-4">
      <input
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="笔记标题"
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3 py-2 text-lg font-medium outline-none focus:ring-1 focus:ring-[var(--color-brand-500)]"
      />
      <div className="flex flex-wrap gap-3">
        <select
          value={week}
          onChange={(e) => setWeek(e.target.value)}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3 py-2 text-sm"
        >
          <option value="">未分周</option>
          {["W1", "W2", "W3", "W4", "W5", "W6"].map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="标签，逗号分隔，如 rag,W2"
          className="min-w-[200px] flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3 py-2 text-sm"
        />
      </div>
      <textarea
        required
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="card min-h-[50vh] w-full resize-y bg-[var(--color-bg-elev)] p-4 font-mono text-sm outline-none focus:ring-1 focus:ring-[var(--color-brand-500)]"
        spellCheck={false}
      />
      {error && (
        <p className="text-sm text-[var(--color-lint-error)]">{error}</p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="btn-brand flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-60"
      >
        {saving ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Save size={14} />
        )}
        创建笔记
      </button>
    </form>
  );
}

export default function NewNotePage() {
  return (
    <div className="section-pad px-6 sm:px-8">
      <Link
        href="/notes"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]"
      >
        <ArrowLeft size={14} />
        返回笔记列表
      </Link>
      <h1 className="mb-6 text-2xl font-semibold">新建笔记</h1>
      <Suspense fallback={<p className="text-sm text-[var(--color-text-muted)]">加载中…</p>}>
        <NewNoteForm />
      </Suspense>
    </div>
  );
}
