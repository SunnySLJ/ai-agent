# 本地 agent 资料映射

父级 `../../agent/` 是资料库。本项目只引用，不移动、不改写。

## 岗位能力到资料路径

| 岗位能力 | 本地路径 | 用法 |
|---|---|---|
| LLM API 接入 | `../../agent/part01-agent-api` | 第 1 周 API、流式输出、模型调用 |
| 本地模型部署 | `../../agent/part02-agent-local` | 了解本地模型和私有化部署，不作为第 1 月主线 |
| Agent 基础 | `../../agent/part03-agent-basic` | 建立 Agent 概念、Prompt 和最小流程 |
| LangChain / DeepAgents | `../../agent/part04-agent-langchain` | 学 Agent 编排、Agentic RAG、DeepAgents |
| RAG 基础到评估 | `../../agent/part05-agent-rag` | 第 2 周主线 |
| LlamaIndex | `../../agent/part06-agent-llamaindex` | 补结构化检索、多模态检索 |
| Agent Skills | `../../agent/part07-agent-skills` | 工具调用、技能注册、执行器 |
| Memory | `../../agent/part08-agent-memory` | 短期和长期记忆设计 |
| Context Engineering | `../../agent/part09-agent-context` | 上下文隔离、压缩、选择 |
| FastAPI 基础 | `../../agent/part10-agent` | 了解 Python AI 服务常见形态，Java 项目可借鉴接口设计 |
| Agent 设计与部署 | `../../agent/part11-agent-design` | 架构设计、接口设计、上线 |
| Docker/K8s | `../../agent/part12-agent-docker` | 作品集部署说明 |
| Agent 评估 | `../../agent/part13-agent-score` | 评估集、指标、优化 |
| 多智能体 | `../../agent/part14-agent-help` | Router/Supervisor/Worker |
| Agent Skills / Super | `../../agent/part15-agent-skill-super`、`../../agent/part16-agent-skill-super` | Skill 系统和 OpenClaw 项目理解 |
| Claude Code 源码 | `../../agent/part17-agent-claude-code` | 理解代码 Agent 和工具安全边界 |
| DeepSeek OCR | `../../agent/part18-agent-deepseek` | 多模态/OCR 加分项 |
| Harness | `../../agent/part19-agent-harness`、`../../agent/part24-agent-harness-special` | 自进化、工作台、工程驾驭 |
| OpenClaw | `../../agent/part20-agent-openclaw`、`../../agent/part21-agent-openclaw-memory`、`../../agent/part25-agent-openclaw-special` | 工业级 Agent 架构、记忆、多智能体 |
| 综合案例 | `../../agent/part22-agent-workspace` | 作品集选题参考 |
| Claude 专题 | `../../agent/part23-agent-claude-special` | 上下文工程、多智能体、工作台范式 |

## 一个月学习优先级

选型已调整为 Python Agent/RAG 主链路 + Java 业务工具层。下面的 Python/RAG/Agent 资料优先级高于 Java 框架资料；Java 资料主要用于业务接口、部署和工程化表达。

第一优先级：

- `part01-agent-api`
- `part03-agent-basic`
- `part04-agent-langchain`
- `part05-agent-rag`
- `part07-agent-skills`
- `part08-agent-memory`
- `part09-agent-context`
- `part13-agent-score`

第二优先级：

- `part06-agent-llamaindex`
- `part11-agent-design`
- `part12-agent-docker`
- `part14-agent-help`
- `part22-agent-workspace`

第三优先级：

- `part16-agent-skill-super`
- `part20-agent-openclaw`
- `part21-agent-openclaw-memory`
- `part24-agent-harness-special`
- `part25-agent-openclaw-special`

暂不主攻：

- 大模型训练和微调细节。
- GPU/推理框架深水区。
- 复杂多模态训练。
