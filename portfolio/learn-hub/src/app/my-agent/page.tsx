"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Code2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type AgentModule = {
  id: string;
  name: string;
  parent_id: string | null;
  description: string | null;
  code_path: string | null;
  interview_script: string | null;
};

type AgentModuleNode = AgentModule & { children: AgentModuleNode[] };

function TreeNode({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: AgentModuleNode;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const active = selectedId === node.id;

  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(node.id)}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
          active
            ? "bg-[var(--color-bg-hover)] text-[var(--color-text-primary)]"
            : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {node.children.length > 0 ? (
          <ChevronRight
            size={14}
            className={cn("shrink-0", active && "text-[var(--color-brand-400)]")}
          />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {node.children.map((child) => (
        <TreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export default function MyAgentPage() {
  const [tree, setTree] = useState<AgentModuleNode[]>([]);
  const [modules, setModules] = useState<AgentModule[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agent-modules")
      .then((r) => r.json())
      .then((data: { tree: AgentModuleNode[]; modules: AgentModule[] }) => {
        setTree(data.tree ?? []);
        setModules(data.modules ?? []);
        const first = data.tree?.[0];
        if (first) setSelectedId(first.id);
      })
      .finally(() => setLoading(false));
  }, []);

  const selected = modules.find((m) => m.id === selectedId);

  return (
    <div className="section-pad px-6 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-semibold tracking-tight">我的 Agent</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          ProjectForge 架构树与面试讲法
        </p>

        {loading && (
          <div className="card mt-8 p-8 text-center text-sm text-[var(--color-text-muted)]">
            加载中…
          </div>
        )}

        {!loading && (
          <div className="mt-8 grid gap-4 lg:grid-cols-[240px_1fr]">
            <div className="card p-3">
              <p className="mb-2 px-2 text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                架构树
              </p>
              {tree.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  depth={0}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              ))}
            </div>

            <div className="card p-6">
              {selected ? (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-medium">{selected.name}</h2>
                    {selected.description && (
                      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        {selected.description}
                      </p>
                    )}
                  </div>

                  {selected.code_path && (
                    <div className="flex items-center gap-2 text-sm">
                      <Code2
                        size={14}
                        className="text-[var(--color-brand-400)]"
                      />
                      <code className="font-mono text-xs text-[var(--color-text-muted)]">
                        {selected.code_path}
                      </code>
                    </div>
                  )}

                  {selected.interview_script && (
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                        <FileText size={12} />
                        面试讲法（STAR）
                      </div>
                      <div className="rounded-lg border border-[var(--color-brand-500)]/30 bg-[var(--color-brand-glow)] p-4">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-primary)]">
                          {selected.interview_script}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-text-muted)]">
                  选择左侧模块查看详情
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
