# rag/ — Agent 课程资料精华索引

> 整合自 `../../agent/` 课程库，提炼对 **harness-agent + ProjectForge** 直接有用的知识点。  
> 禁止直接修改 `agent/` 目录，本目录为只写提炼笔记。  
> 更新：2026-07-05

---

## 目录结构

```text
rag/
  00-index.md                 ← 本文件：资源地图 + 学习路径
  01-harness-engineering.md   ← Harness Engineering 四大支柱（核心理论）
  02-rag-retrieval-eval.md    ← RAG 检索 + 评估 + Eval Dashboard
  03-multi-agent-patterns.md  ← 多智能体协作模式（Supervisor/Swarm/GAN）
  04-skill-claude-md.md       ← SKILL.md / CLAUDE.md / AGENTS.md 设计规范
  05-deepresearch.md          ← DeepResearch Agent 构建参考
  06-context-memory.md        ← 上下文工程 + 长短期记忆管理
```

---

## agent/ 目录扫描结果（25 个 part）

### 直接相关（★★★ 优先读）

| part | 内容 | 对应项目模块 |
|---|---|---|
| `part19-agent-harness/` | GStack PDF + Harness Engineering 技术实战 PDF + Hermes（上下） | **harness-agent 工程核心** |
| `part24-agent-harness-special/` | Harness 原理 + Mini Harness + DeepAgents + Hermes + Curator + FF-OpenHermes | **harness-agent 进阶** |
| `part05-agent-rag/` | RAG 入门 + 多格式解析 + 切分 + 向量库 + 检索生成评估 | `retrieval.py` `vector_store.py` |
| `part13-agent-score/` | Agent 评估与优化 | `agent-eval-dashboard/` |
| `part22-agent-workspace/案例4` | DeepResearch + Agent | `deep_research.py` |
| `part22-agent-workspace/案例11` | LangChain 文档审核 Agent v1.0 | `verified_knowledge.py` |
| `part22-agent-workspace/案例12` | 通用 AI 文档审核 v2.0 + HITL | `verified_knowledge.py` |

### 重要参考（★★ 按需读）

| part | 内容 | 对应项目模块 |
|---|---|---|
| `part14-agent-help/` | 多智能体协作（Supervisor/Swarm/Hierarchical） | `forge_supervisor.py` |
| `part04-agent-langchain/` | LangChain v1.0（5 个 part，含 Agentic RAG） | ADR 0002 LangGraph |
| `part11-agent-design/` | 主流 Agent 类型及接口设计 + 部署上线 | API 设计 |
| `part10-agent/` | FastAPI 基础（路由、Pydantic、SSE） | `api.py` |
| `part12-agent-docker/` | Docker + Compose + K8s | `compose.yaml` |
| `part17-agent-claude-code/` | Claude Code 源码解读 PDF | harness-agent 钩子设计 |
| `part23-agent-claude-special/` | Claude Code 能力边界 + 多智能体 + Fufan-CC | harness-agent 高级用法 |

### 按需参考（★ 遇到问题时查）

| part | 内容 |
|---|---|
| `part03-agent-basic/` | Prompt 工程、ReAct 概念 |
| `part07-agent-skills/` | Agent Skills 设计基础 |
| `part08-agent-memory/` | 长短期记忆管理（MemoryStore） |
| `part09-agent-context/` | 上下文工程组合编排 |
| `part01-agent-api/` | LLM API 接入基础 |
| `part06-agent-llamaindex/` | LlamaIndex 结构化检索 |

### 暂缓（本阶段用不到）

| part | 内容 | 暂缓原因 |
|---|---|---|
| `part02-agent-local/` | 本地大模型 | 与求职叙事无关 |
| `part15/16-agent-skill-super/` | OpenClaw 深水 | 暂不需要 |
| `part18-agent-deepseek/` | DeepSeek 专题 | 按需 |
| `part20/21-agent-openclaw/` | OpenClaw 应用 | 暂不需要 |
| `part25-agent-openclaw-special/` | OpenClaw 特辑 | 暂不需要 |

---

## 学习路径（与 W1–W6 排期对应）

```text
W1  RAG 闭环
    → 读 rag/02-rag-retrieval-eval.md（本地提炼笔记）
    → 对照 part05-agent-rag/ 补 RAG 八股
    → 跑 eval 100%

W2  查证 + 案例11
    → 读 rag/02（Claim-Evidence 部分）
    → 对照 part22/案例11/12 notebook
    → 补 verified_knowledge.py

W3  LangGraph + 编排
    → 读 rag/03-multi-agent-patterns.md
    → 对照 part04-langchain/Part4 Agentic RAG

W4  DeepResearch + Forge
    → 读 rag/05-deepresearch.md
    → 对照 part22/案例4 notebook

W5  Harness 工程
    → 读 rag/01-harness-engineering.md（已提炼）
    → 读 rag/04-skill-claude-md.md
    → 跑 hstack 走完 1 个 side project

W6  测试 + 复盘
    → 对照 part12-docker + part13-eval
    → Harness retro 阶段产物
```

---

## 关键源文件路径速查

```bash
# Harness 理论 PDFs
../../agent/part19-agent-harness/Harness\ Engineering\ 技术实战.pdf
../../agent/part19-agent-harness/Agent\ Swarm\ 一人公司最佳实践：YC\ 创始人\ GStack\ 项目实战.pdf
../../agent/part19-agent-harness/Harness\ Engineering\ 最佳实践：Hermes\ Agent\ 快速入门实战（上）.pdf
../../agent/part19-agent-harness/Harness\ Engineering\ 最佳实践：Hermes\ Agent\ 快速入门实战（下）.pdf

# Harness 实战 notebooks
../../agent/part24-agent-harness-special/Part\ 1.*/Harness_Engineering_第一节课_原理与概念.ipynb
../../agent/part24-agent-harness-special/Part\ 2.*/Harness_Engineering_第二节课_mini-Harness.ipynb
../../agent/part24-agent-harness-special/Part\ 3.*/HarnessEngineering_第三节_deepAgents实战.ipynb
../../agent/part24-agent-harness-special/Part\ 4.*/HarnessEngineering第四节-Hermes基础与记忆系统.ipynb

# RAG
../../agent/part05-agent-rag/Part\ 1.*/大模型RAG入门基础架构与实战.ipynb
../../agent/part05-agent-rag/Part\ 5.*/大模型RAG检索生成和评估实战.ipynb

# 文档审核 + DeepResearch
../../agent/part22-agent-workspace/【加餐】案例11：*/LangChain\ v1.0\ 文档审核类Agent开发实战.ipynb
../../agent/part22-agent-workspace/案例4：DeepResearch+Agent/基于DeepResearch\ Agent构建企业级自动化调研系统.ipynb

# 多智能体
../../agent/part14-agent-help/多智能体协作模式.ipynb
```
