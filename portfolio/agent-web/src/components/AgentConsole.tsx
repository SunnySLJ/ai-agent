"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  askQuestion,
  askQuestionStream,
  checkHealth,
  confirmApproval,
  fetchSummary,
  fetchTools,
  getApiBaseUrl,
  ingestDocument,
} from "@/lib/api";
import type { AgentResponse, ChatMessage, Citation, EvaluationSummary, ToolCall } from "@/lib/types";

const QUICK_PROMPTS = [
  "Python 和 Java 在 Agent RAG 项目里怎么分工?",
  "查询订单 ORD-1001 的状态",
  "创建一个待办：跟进客户",
  "Agent RAG 为什么需要 Qdrant 向量库?",
];

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function responseToAssistantMessage(response: AgentResponse): ChatMessage {
  return {
    id: makeId(),
    role: "assistant",
    content: response.answer,
    meta: {
      refused: response.refused,
      citations: response.citations,
      toolCalls: response.trace.tool_calls,
      approvalId: response.approval_id,
    },
  };
}

export default function AgentConsole() {
  const [healthy, setHealthy] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [streaming, setStreaming] = useState(true);
  const [loading, setLoading] = useState(false);
  const [tools, setTools] = useState<string[]>([]);
  const [summary, setSummary] = useState<EvaluationSummary | null>(null);
  const [latestCitations, setLatestCitations] = useState<Citation[]>([]);
  const [latestTools, setLatestTools] = useState<ToolCall[]>([]);
  const [pendingApprovalId, setPendingApprovalId] = useState<string | null>(null);

  const [docId, setDocId] = useState("hybrid-architecture");
  const [docTitle, setDocTitle] = useState("Hybrid Agent Architecture");
  const [docContent, setDocContent] = useState(
    "Python owns Agent RAG orchestration while Java exposes business tool APIs through OpenAPI and MCP.",
  );
  const [docStatus, setDocStatus] = useState<string | null>(null);

  const apiBase = useMemo(() => getApiBaseUrl(), []);

  useEffect(() => {
    void refreshStatus();
  }, []);

  async function refreshStatus() {
    const [ok, toolList, summaryData] = await Promise.all([
      checkHealth(),
      fetchTools().catch(() => []),
      fetchSummary().catch(() => null),
    ]);
    setHealthy(ok);
    setTools(toolList);
    setSummary(summaryData);
  }

  async function handleAsk(event: FormEvent) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: makeId(),
      role: "user",
      content: trimmed,
    };
    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setLoading(true);
    setPendingApprovalId(null);

    try {
      if (streaming) {
        const assistantId = makeId();
        setMessages((current) => [
          ...current,
          { id: assistantId, role: "assistant", content: "", meta: { streaming: true } },
        ]);

        await askQuestionStream(trimmed, sessionId, {
          onMeta: (meta) => {
            if (typeof meta.session_id === "string") {
              setSessionId(meta.session_id);
            }
            if (meta.approval_id && meta.approval_required) {
              setPendingApprovalId(String(meta.approval_id));
            }
          },
          onToken: (delta) => {
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId
                  ? { ...message, content: message.content + delta }
                  : message,
              ),
            );
          },
          onDone: (response) => {
            setSessionId(response.session_id ?? sessionId);
            setLatestCitations(response.citations);
            setLatestTools(response.trace.tool_calls);
            if (response.approval_required && response.approval_id) {
              setPendingApprovalId(response.approval_id);
            }
            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId ? responseToAssistantMessage(response) : message,
              ),
            );
            void refreshStatus();
          },
        });
      } else {
        const response = await askQuestion(trimmed, sessionId);
        setSessionId(response.session_id ?? sessionId);
        setLatestCitations(response.citations);
        setLatestTools(response.trace.tool_calls);
        if (response.approval_required && response.approval_id) {
          setPendingApprovalId(response.approval_id);
        }
        setMessages((current) => [...current, responseToAssistantMessage(response)]);
        await refreshStatus();
      }
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "assistant",
          content: `请求失败：${error instanceof Error ? error.message : String(error)}`,
          meta: { refused: true },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmApproval() {
    if (!pendingApprovalId || loading) {
      return;
    }
    setLoading(true);
    try {
      const response = await confirmApproval(pendingApprovalId);
      setPendingApprovalId(null);
      setMessages((current) => [...current, responseToAssistantMessage(response)]);
      setLatestTools(response.trace.tool_calls);
      await refreshStatus();
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "assistant",
          content: `审批失败：${error instanceof Error ? error.message : String(error)}`,
          meta: { refused: true },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleIngest(event: FormEvent) {
    event.preventDefault();
    setDocStatus(null);
    try {
      await ingestDocument({
        doc_id: docId,
        title: docTitle,
        content: docContent,
      });
      setDocStatus(`已入库：${docId}`);
    } catch (error) {
      setDocStatus(`入库失败：${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <h1>企业知识库 Agent Platform</h1>
          <p>
            Web 展示层连接 Python FastAPI（RAG / 工具 / 安全 / 流式）与 Java 业务工具服务。
            适合演示引用、拒答、工具 trace、人工确认和 eval 指标。
          </p>
        </div>
        <div className="status-pill">
          <span className={`status-dot ${healthy ? "ok" : ""}`} />
          API {healthy ? "在线" : "离线"} · {apiBase}
        </div>
      </section>

      <section className="layout">
        <div className="stack">
          <section className="panel">
            <div className="panel-header">
              <h2>对话</h2>
              <label className="hint">
                <input
                  type="checkbox"
                  checked={streaming}
                  onChange={(event) => setStreaming(event.target.checked)}
                />{" "}
                SSE 流式
              </label>
            </div>
            <div className="panel-body stack">
              <div className="quick-prompts">
                {QUICK_PROMPTS.map((prompt) => (
                  <button key={prompt} type="button" onClick={() => setQuestion(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="chat-log">
                {messages.length === 0 ? (
                  <p className="hint">先提问，或点击上方示例。支持多轮会话与流式输出。</p>
                ) : (
                  messages.map((message) => (
                    <article
                      key={message.id}
                      className={`message ${message.role} ${message.meta?.refused ? "refused" : ""}`}
                    >
                      <div className="message-label">
                        {message.role === "user" ? "用户" : "Agent"}
                      </div>
                      <div>{message.content || (message.meta?.streaming ? "生成中..." : "")}</div>
                      {message.meta?.citations && message.meta.citations.length > 0 && (
                        <div className="meta-row">
                          {message.meta.citations.map((citation) => (
                            <span key={citation.chunk_id} className="chip">
                              引用：{citation.title}
                            </span>
                          ))}
                        </div>
                      )}
                      {message.meta?.toolCalls && message.meta.toolCalls.length > 0 && (
                        <div className="meta-row">
                          {message.meta.toolCalls.map((tool) => (
                            <span key={`${tool.name}-${tool.result}`} className="chip tool">
                              {tool.name} · {tool.success ? "成功" : "失败"}
                            </span>
                          ))}
                        </div>
                      )}
                    </article>
                  ))
                )}
              </div>

              {pendingApprovalId && (
                <div className="approval-banner">
                  <strong>写操作待确认</strong>
                  <p className="hint">
                    创建待办属于高风险写操作，需人工确认后才会调用 Java 工具服务。
                  </p>
                  <button className="danger" type="button" onClick={handleConfirmApproval} disabled={loading}>
                    确认执行 {pendingApprovalId}
                  </button>
                </div>
              )}

              <form className="composer" onSubmit={handleAsk}>
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="输入问题，例如：查询订单 ORD-1001 的状态"
                />
                <div className="composer-actions">
                  <button className="primary" type="submit" disabled={loading}>
                    {loading ? "处理中..." : "发送"}
                  </button>
                  <button
                    className="secondary"
                    type="button"
                    onClick={() => {
                      setMessages([]);
                      setSessionId(null);
                      setPendingApprovalId(null);
                    }}
                  >
                    新会话
                  </button>
                  {sessionId && <span className="hint">session: {sessionId}</span>}
                </div>
              </form>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>文档入库</h2>
            </div>
            <div className="panel-body">
              <form className="stack" onSubmit={handleIngest}>
                <div className="field">
                  <label htmlFor="doc-id">doc_id</label>
                  <input id="doc-id" value={docId} onChange={(event) => setDocId(event.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="doc-title">标题</label>
                  <input
                    id="doc-title"
                    value={docTitle}
                    onChange={(event) => setDocTitle(event.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="doc-content">内容（Markdown）</label>
                  <textarea
                    id="doc-content"
                    rows={6}
                    value={docContent}
                    onChange={(event) => setDocContent(event.target.value)}
                  />
                </div>
                <button className="primary" type="submit">
                  写入知识库
                </button>
                {docStatus && <p className="hint">{docStatus}</p>}
              </form>
            </div>
          </section>
        </div>

        <aside className="stack">
          <section className="panel">
            <div className="panel-header">
              <h2>引用与工具</h2>
            </div>
            <div className="panel-body stack">
              {latestCitations.length === 0 && latestTools.length === 0 ? (
                <p className="hint">最近一次回答的引用和工具调用会显示在这里。</p>
              ) : (
                <>
                  {latestCitations.map((citation) => (
                    <article key={citation.chunk_id} className="citation-card">
                      <h3>{citation.title}</h3>
                      <p>{citation.snippet}</p>
                      <p>score: {citation.score.toFixed(3)}</p>
                    </article>
                  ))}
                  {latestTools.map((tool) => (
                    <article key={`${tool.name}-${tool.result}`} className="tool-card">
                      <strong>{tool.name}</strong>
                      <p>{tool.result}</p>
                    </article>
                  ))}
                </>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Eval 概览</h2>
            </div>
            <div className="panel-body">
              {summary ? (
                <div className="metrics">
                  <article className="metric-card">
                    <strong>总运行</strong>
                    <span>{summary.total_runs}</span>
                  </article>
                  <article className="metric-card">
                    <strong>拒答次数</strong>
                    <span>{summary.refusal_count}</span>
                  </article>
                  <article className="metric-card">
                    <strong>工具调用</strong>
                    <span>{summary.tool_call_count}</span>
                  </article>
                  <article className="metric-card">
                    <strong>平均延迟</strong>
                    <span>{summary.average_latency_ms.toFixed(2)} ms</span>
                  </article>
                </div>
              ) : (
                <p className="hint">启动 API 并完成至少一次问答后，这里会显示 summary 指标。</p>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>可用工具</h2>
            </div>
            <div className="panel-body stack">
              {tools.length === 0 ? (
                <p className="hint">未获取到工具列表。</p>
              ) : (
                tools.map((tool) => (
                  <article key={tool} className="tool-card">
                    <strong>{tool}</strong>
                  </article>
                ))
              )}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
