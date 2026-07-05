"use client";

import Link from "next/link";
import { FileText, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { docPathToHref } from "@/lib/docs/urls";

type DocItem = { path: string; title: string; editable: boolean };

export default function DocsIndexPage() {
  const [docs, setDocs] = useState<DocItem[]>([]);

  useEffect(() => {
    fetch("/api/docs")
      .then((r) => r.json())
      .then((d) => setDocs(d.docs ?? []));
  }, []);

  return (
    <div className="section-pad px-6 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight">项目文档</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          可直接在浏览器中打开并编辑 Markdown 文件，保存后写入{" "}
          <code className="text-[var(--color-brand-400)]">work/ai-agent/</code>
        </p>

        <ul className="card mt-6 divide-y divide-[var(--color-border)]">
          {docs.map((doc) => (
            <li key={doc.path}>
              <Link
                href={docPathToHref(doc.path)}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-[var(--color-bg-hover)]"
              >
                <span className="flex items-center gap-2">
                  <FileText
                    size={14}
                    className="text-[var(--color-brand-400)]"
                  />
                  {doc.title}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
                  {doc.editable && <Pencil size={10} />}
                  {doc.path}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
