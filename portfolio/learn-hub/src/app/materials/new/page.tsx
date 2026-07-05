"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

function NewMaterialForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultWeek = searchParams.get("week") ?? "W2";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("# \n\n");
  const [week, setWeek] = useState(defaultWeek);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, week }),
      });
      if (!res.ok) throw new Error("创建失败");
      const data = await res.json();
      router.push(`/materials/${data.id}`);
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
        placeholder="资料标题"
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3 py-2 text-lg font-medium outline-none focus:ring-1 focus:ring-[var(--color-brand-500)]"
      />
      <select
        value={week}
        onChange={(e) => setWeek(e.target.value)}
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3 py-2 text-sm"
      >
        {["W1", "W2", "W3", "W4", "W5", "W6"].map((w) => (
          <option key={w} value={w}>
            {w}
          </option>
        ))}
      </select>
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
        创建资料
      </button>
    </form>
  );
}

export default function NewMaterialPage() {
  return (
    <div className="section-pad px-6 sm:px-8">
      <Link
        href="/materials"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]"
      >
        <ArrowLeft size={14} />
        返回资料列表
      </Link>
      <h1 className="mb-6 text-2xl font-semibold">新建学习资料</h1>
      <Suspense fallback={<p className="text-sm text-[var(--color-text-muted)]">加载中…</p>}>
        <NewMaterialForm />
      </Suspense>
    </div>
  );
}
