"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  fetchProjectForgeStages,
  getApiBaseUrl,
  runProjectForgeDemo,
} from "@/lib/api";
import type { ForgeStageArtifact, ForgeStageMeta, ProjectForgeRun } from "@/lib/types";

const DEFAULT_IDEA =
  "为 agent-platform 增加查证型知识库与 ProjectForge 九阶段工作台，让架构和 PRD 结论可核验。";

function statusClass(status: string): string {
  if (status === "verified") {
    return "claim-verified";
  }
  if (status === "contradicted") {
    return "claim-contradicted";
  }
  if (status === "pending_review" || status === "weak") {
    return "claim-pending";
  }
  return "claim-unverified";
}

function VerificationPanel({
  verification,
}: {
  verification: ForgeStageArtifact["verification"];
}) {
  if (!verification) {
    return <p className="hint">本阶段未触发查证门。</p>;
  }

  return (
    <div className="verification-panel">
      <div className="verification-summary">
        <strong>查证结果</strong>
        <span className={verification.should_refuse ? "badge danger" : "badge success"}>
          {verification.should_refuse ? "建议复核" : "可通过"}
        </span>
        <p className="hint">
          整体置信 {verification.overall_confidence.toFixed(2)} · {verification.summary}
        </p>
      </div>
      <div className="claim-list">
        {verification.claims.slice(0, 4).map((claim) => (
          <article key={claim.claim_id} className={`claim-card ${statusClass(claim.status)}`}>
            <div className="claim-header">
              <span className="claim-status">{claim.status}</span>
              <span className="hint">置信 {claim.confidence.toFixed(2)}</span>
            </div>
            <p>{claim.text}</p>
            {claim.links[0] && (
              <p className="hint">
                证据：《{claim.evidences[0]?.title ?? "未知"}》· {claim.links[0].relation} ·
                对齐 {claim.links[0].alignment_score.toFixed(2)}
              </p>
            )}
            {claim.links.length > 1 && (
              <details className="claim-details">
                <summary className="hint">更多证据 ({claim.links.length - 1})</summary>
                <ul>
                  {claim.links.slice(1).map((link) => (
                    <li key={link.evidence_id}>
                      {link.relation} · {link.alignment_score.toFixed(2)} — {link.rationale}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

export default function ProjectForgeWorkbench() {
  const [stageMeta, setStageMeta] = useState<ForgeStageMeta[]>([]);
  const [idea, setIdea] = useState(DEFAULT_IDEA);
  const [priorRunId, setPriorRunId] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [run, setRun] = useState<ProjectForgeRun | null>(null);
  const [activeStageId, setActiveStageId] = useState<string>("research");

  const apiBase = useMemo(() => getApiBaseUrl(), []);

  useEffect(() => {
    void fetchProjectForgeStages()
      .then(setStageMeta)
      .catch(() => setStageMeta([]));
  }, []);

  const activeStage = run?.stages.find((stage) => stage.stage_id === activeStageId) ?? null;
  const completedCount = run?.stages.length ?? 0;

  async function handleRunDemo(event: FormEvent) {
    event.preventDefault();
    if (loading) {
      return;
    }

    setLoading(true);
    setStatus("正在运行九阶段演示链路...");
    setRun(null);

    try {
      const result = await runProjectForgeDemo(
        idea.trim() || DEFAULT_IDEA,
        priorRunId.trim() || null,
      );
      setRun(result);
      setActiveStageId(result.stages[0]?.stage_id ?? "research");
      setStatus(`演示完成：${result.stages.length} 个阶段已生成（run_id: ${result.run_id.slice(0, 8)}）`);
    } catch (error) {
      setStatus(`运行失败：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <h1>ProjectForge 造物工作台</h1>
          <p>
            全链路 vibe coding 演示：需求调研 → 原型 → 架构 → PRD → 开发 → 测试 → 部署 → 复盘。
            架构/PRD 阶段内置查证型知识库（Claim-Evidence 对齐）。
          </p>
        </div>
        <div className="status-pill">
          <span className="status-dot ok" />
          API · {apiBase}
        </div>
      </section>

      <section className="layout">
        <div className="stack">
          <section className="panel">
            <div className="panel-header">
              <h2>启动演示链路</h2>
            </div>
            <div className="panel-body">
              <form className="stack" onSubmit={handleRunDemo}>
                <div className="field">
                  <label htmlFor="forge-idea">产品想法</label>
                  <textarea
                    id="forge-idea"
                    rows={4}
                    value={idea}
                    onChange={(event) => setIdea(event.target.value)}
                    placeholder="描述你想做的项目..."
                  />
                </div>
                <div className="field">
                  <label htmlFor="forge-prior-run">上一轮 run_id（可选，第二轮迭代）</label>
                  <input
                    id="forge-prior-run"
                    type="text"
                    value={priorRunId}
                    onChange={(event) => setPriorRunId(event.target.value)}
                    placeholder="粘贴上一轮 run_id 以继承 ADR/PRD"
                  />
                </div>
                <button className="primary" type="submit" disabled={loading}>
                  {loading ? "运行中..." : "运行九阶段演示"}
                </button>
                {status && <p className="hint">{status}</p>}
              </form>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>阶段产物</h2>
              {run && <span className="hint">{completedCount}/9 完成</span>}
            </div>
            <div className="panel-body stack">
              {!activeStage ? (
                <p className="hint">运行演示后，点击左侧阶段查看 Markdown 产物与查证结果。</p>
              ) : (
                <>
                  <article className="stage-detail-card">
                    <div className="stage-detail-header">
                      <div>
                        <h3>{activeStage.label}</h3>
                        <p className="hint">
                          {activeStage.agent} · 引擎 {activeStage.engine}
                        </p>
                      </div>
                      <span className="chip">{activeStage.title}</span>
                    </div>
                    <p>{activeStage.summary}</p>
                  </article>
                  <pre className="markdown-preview">{activeStage.markdown}</pre>
                  <VerificationPanel verification={activeStage.verification} />
                </>
              )}
            </div>
          </section>
        </div>

        <aside className="stack">
          <section className="panel">
            <div className="panel-header">
              <h2>九阶段进度</h2>
            </div>
            <div className="panel-body stack">
              {(run?.stages ?? stageMeta).map((stage, index) => {
                const meta = stageMeta[index];
                const artifact =
                  run?.stages.find((item) => item.stage_id === stage.stage_id) ?? null;
                const stageId = artifact?.stage_id ?? meta?.stage_id ?? `stage-${index + 1}`;
                const label =
                  artifact?.label ?? ("label" in stage ? stage.label : meta?.label ?? `阶段 ${index + 1}`);
                const isActive = activeStageId === stageId;
                const hasVerification = Boolean(artifact?.verification);

                return (
                  <button
                    key={stageId}
                    type="button"
                    className={`stage-step ${isActive ? "active" : ""} ${artifact ? "done" : ""}`}
                    onClick={() => {
                      if (artifact) {
                        setActiveStageId(stageId);
                      }
                    }}
                    disabled={!artifact}
                  >
                    <span className="stage-step-index">{index + 1}</span>
                    <span className="stage-step-body">
                      <strong>{label}</strong>
                      <span className="hint">
                        {artifact ? artifact.title : "等待运行"}
                        {hasVerification ? " · 已查证" : ""}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {run && (
            <section className="panel">
              <div className="panel-header">
                <h2>交付信息</h2>
              </div>
              <div className="panel-body stack">
                <article className="tool-card">
                  <strong>部署地址</strong>
                  <p>{run.deploy_url}</p>
                </article>
                <article className="tool-card">
                  <strong>代码仓库</strong>
                  <p>{run.repository}</p>
                </article>
                <article className="tool-card">
                  <strong>当前阶段</strong>
                  <p>{run.current_stage}</p>
                </article>
                {run.parent_run_id && (
                  <article className="tool-card">
                    <strong>继承自</strong>
                    <p>{run.parent_run_id}</p>
                  </article>
                )}
              </div>
            </section>
          )}

          <section className="panel">
            <div className="panel-header">
              <h2>能力引擎</h2>
            </div>
            <div className="panel-body stack">
              <article className="tool-card">
                <strong>DeepResearch</strong>
                <p>阶段 ① 需求调研 · 子问题规划 + 脚注报告（已接入 demo）</p>
              </article>
              <article className="tool-card">
                <strong>企业知识库</strong>
                <p>阶段 ③ 架构选项 · 内部文档 RAG + citation</p>
              </article>
              <article className="tool-card">
                <strong>查证型知识库</strong>
                <p>阶段 ③④⑤ · Claim-Evidence 对齐与拒答门控</p>
              </article>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
