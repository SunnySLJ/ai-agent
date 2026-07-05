"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";

type Material = {
  id: string;
  title: string;
  week: string | null;
  step_id: string | null;
};

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);

  useEffect(() => {
    fetch("/api/materials")
      .then((r) => r.json())
      .then((d) => setMaterials(d.materials ?? []));
  }, []);

  const byWeek = materials.reduce<Record<string, Material[]>>((acc, m) => {
    const w = m.week ?? "其他";
    (acc[w] ??= []).push(m);
    return acc;
  }, {});

  const weeks = Object.keys(byWeek).sort();

  return (
    <div className="section-pad px-6 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">学习资料</h1>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              全部存在数据库中，可编辑 · 学习路线中的链接指向这里
            </p>
          </div>
          <Link
            href="/materials/new"
            className="btn-brand flex items-center gap-1.5 px-3 py-2 text-sm"
          >
            <Plus size={14} />
            新建资料
          </Link>
        </div>

        <div className="mt-8 space-y-6">
          {weeks.map((week) => (
            <section key={week}>
              <h2 className="mb-2 text-sm font-medium text-[var(--color-brand-400)]">
                {week}
              </h2>
              <ul className="card divide-y divide-[var(--color-border)]">
                {byWeek[week]?.map((m) => (
                  <li key={m.id}>
                    <Link
                      href={`/materials/${m.id}`}
                      className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-[var(--color-bg-hover)]"
                    >
                      <FileText size={14} className="text-[var(--color-brand-400)]" />
                      {m.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {materials.length === 0 && (
            <div className="card p-8 text-center text-sm text-[var(--color-text-muted)]">
              暂无资料。运行 seed 或点击「新建资料」。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
