# shuang-plan.md — 项目总需求（Agent 必读）

> **更新：2026-07-05**（1 个月学习期 + harness-agent 工程）
> **优先级：最高。** Cursor / Codex / Claude 在本仓库执行任何任务前，**先读本文**，再读 [agent.md](agent.md) 与 [AGENTS.md](AGENTS.md)。

---

## 一、以终为始：我要什么

| 项 | 内容 |
|---|---|
| **目标** | 杭州 · **Python AI 应用 / Agent / RAG 工程师** · 月薪 **20K 起步**（可谈 18～25K） |
| **背景** | 30 岁，**5 年 Java 后端**（仅作学习 Python 的加速器，**简历与面试不再主打 Java**） |
| **不投** | 纯算法、模型训练、CUDA、论文硬门槛、Prompt 运营实习岗 |
| **时间线** | **第 1 个月（2026-07-05 起）：只学习 + 做工程，不投简历**；拿 offer 按 **4～8 周** 规划（第 2 个月起再开投） |
| **长期** | 35 岁前能独立设计、落地、评估企业级 Agent 系统 |

---

## 二、战略 pivot（2026-07-05 生效）

```text
❌ 旧叙事：Python AI 主链路 + Java 业务工具层混合架构
✅ 新叙事：纯 Python AI 应用工程师，一个作品集项目打天下
```

- **Java**：仓库内 Java 代码**已删除**；简历/面试**纯 Python RAG**。
- **简历核心项目**：**ProjectForge 企业级 AI Agent 平台**（内嵌三引擎，不是四个平级 SaaS）。
- **课程资料**：只读 `../../agent/`，不移动不改写。资料很多，**不必全学**——见本文 §「agent 资料库怎么用」。

---

## agent 资料库怎么用（重要）

```text
../../agent/              ← 课程库（只读，25 个 part，notebook + 案例源码）
../../harness-agent/      ← Harness 工程（CLI 阶段门，与 agent 同级）
work/ai-agent/            ← 作品集工程库（ProjectForge，读写）
```

**原则：以终为始，只学能写进简历、能答面试的；其余当字典查阅。**

### 三套文件夹别混

| | `agent/` | `harness-agent/` | `work/ai-agent/` |
|---|---|---|---|
| 性质 | 课程/课件/案例 | AI 交付 Harness CLI | 求职作品集 + 文档 + 测试 |
| Agent 能否改 | ❌ 只引用路径 | ✅ 可改代码 | ✅ 可改代码和文档 |
| 你日常在哪写代码 | 不在这里 | `hstack init` 跑 side project | `portfolio/agent-platform/` |

完整映射表：[docs/07-source-map.md](docs/07-source-map.md)

### 求职阶段：只精读这些 part（约 8 个）

| 优先级 | 路径 | 对应你项目里的什么 | 何时读 |
|---|---|---|---|
| ★★★ | `part05-agent-rag` | 企业知识库 RAG | 补 RAG 八股 / 面试前 |
| ★★★ | `part10-agent` | FastAPI | 对照 `api.py`、`notes-fastapi.md` |
| ★★★ | `part13-agent-score` | Eval 评估 | 对照 `agent-eval-dashboard` |
| ★★★ | `part22/案例11 或 案例12` | **文档审核** ↔ `verified_knowledge.py` | 面试「文档审核 Agent」必讲 |
| ★★★ | `part22/案例4 DeepResearch` | DeepResearch | 对照 `deep_research.py` |
| ★★ | `part03-agent-basic` | Prompt、ReAct 概念 | 概念不清时 |
| ★★ | `part04-agent-langchain` | LangChain/LangGraph | 面试被问官方 LangGraph 时 |
| ★★ | `part14-agent-help` | Supervisor 多 Agent | 对照 `forge_supervisor.py` |
| ★ | `part12-agent-docker` | 部署 | 公网部署前 |

### 暂缓 / 入职后再学

`part02` 本地大模型 · `part15-21` OpenClaw 深水 · `part18` OCR · 训练/微调相关

### Harness 专项（与 harness-agent 工程并行）

| 优先级 | 路径 | 用途 |
|---|---|---|
| ★★★ | `../../harness-agent/` | **本阶段主工程**：`hstack` CLI、阶段门、产物模板 |
| ★★ | `part19-agent-harness` | 阶段门、工程驾驭、AI 开发流水线 |
| ★★ | `part24-agent-harness-special` | Harness 进阶、工作台边界 |
| ★ | `part17-agent-claude-code` | 工具安全、MCP、hooks 思路 |
| 对照 | `.codex/skills/shuang-flow` | 文档驱动全链路（brainstorm→PRD→TDD） |
| 对照 | `.codex/skills/shuang-chain` | 测试阶段 / gstack `/qa` 思路 |

### part22 案例速查（资料最多，别全啃）

| 案例 | 路径关键词 | 和简历的关系 |
|---|---|---|
| 案例11 | LangChain v1.0 文档审核 | ↔ 查证型知识库 Claim-Evidence |
| 案例12 | LangChain v1.1 文档审核 v2 + HITL | ↔ 查证 + pending_review |
| 案例4 | DeepResearch + Agent | ↔ `deep_research.py` + 外网搜索 |

**学习动作：** 打开 notebook **对照** `work/ai-agent` 里已实现的模块，能讲「课程案例 → 我工程里怎么落地」，不要重抄一遍案例代码到 agent 目录。

### 给 Cursor Agent 的约定

- 需要查课件时：只读 `../../agent/partXX-...`，**禁止**在 `agent/` 下创建或修改文件  
- Harness 代码：只在 `../../harness-agent/`  
- 作品集代码/文档：只在 `work/ai-agent/`  
- 用户说「按课程做」：先查上表是否已有实现，优先 **补全/对齐作品集或 harness**，而非在 agent 目录开新坑  

---

## 三、BOSS 直聘（⏸ 第 1 个月暂缓）

> **规定：2026-07-05 起 1 个月内不投简历、不刷 BOSS。** 以下链接与筛选规则保留，第 2 个月再启用。

### P0 必搜（主投）

| 搜索词 | 链接 |
|---|---|
| AI Agent | https://www.zhipin.com/web/geek/job?query=AI%20Agent&city=101210100 |
| 大模型应用 | https://www.zhipin.com/web/geek/job?query=%E5%A4%A7%E6%A8%A1%E5%9E%8B%E5%BA%94%E7%94%A8&city=101210100 |
| Python RAG | https://www.zhipin.com/web/geek/job?query=Python%20RAG&city=101210100 |
| FastAPI 大模型 | https://www.zhipin.com/web/geek/job?query=FastAPI%20%E5%A4%A7%E6%A8%A1%E5%9E%8B&city=101210100 |
| LangGraph | https://www.zhipin.com/web/geek/job?query=LangGraph&city=101210100 |
| LangChain | https://www.zhipin.com/web/geek/job?query=LangChain&city=101210100 |

### 暂缓 / 少投

- RAG Java、Spring AI、Java 大模型（除非 JD 明确 Python 为主）

### JD 筛选 5 条（满足 3 条就投）

1. 写 Python / FastAPI / LangChain / RAG  
2. 3～5 年后端或接受后端转 AI 应用  
3. 业务：知识库 / 客服 / **文档审核** / 办公自动化 / 搜索  
4. 薪资 18K+ 或面议  
5. 不要求硕士算法 / 顶会论文  

话术与 Top3 岗位：`logs/applications/boss-messages-ready.md`（需改为纯 Python 版，见 `docs/11-resume-and-interview-pack.md`）

---

## 四、必备技能（纯 Python P0）

Agent 协助编码/学习时，优先巩固下表，**不要扩散到 Java/Spring 新特性**。

| 类别 | 技能 | 仓库证据 |
|---|---|---|
| Python 工程 | FastAPI、Pydantic、unittest | `portfolio/agent-platform/` |
| RAG | 切分、Embedding、Qdrant、BM25+混合检索、Citation、拒答 | `retrieval.py`、`vector_store.py` |
| 查证 / 文档审核 | Claim-Evidence、pending_review、查证门 | `verified_knowledge.py` ↔ part22 案例11 |
| Agent | 状态机编排、Prompt 安全、多轮 session | `graph_orchestrator.py`、`safety.py`、`session.py` |
| DeepResearch | 子问题规划、Tavily/Serper、脚注报告 | `deep_research.py`、`web_search.py` |
| ProjectForge | 九阶段编排、Supervisor、run 持久化 | `project_forge.py`、`forge_store.py` |
| **Harness Agent** | CLI 阶段门、产物模板、AI 交接 brief | `../../harness-agent/` |
| 评估 | eval JSONL、pass/拒答/MRR | `agent-eval-dashboard/` |
| 部署 | Docker Compose、健康检查 | `compose.yaml` |
| **最后阶段** | **公网 HTTPS demo** | ⏸ 用户决定暂缓，本地 + GitHub 先投 |

P1（加分）：官方 LangGraph、Cross-encoder Rerank、LangSmith/Langfuse。

---

## 五、作品集：一个项目对外讲

**名称：** ProjectForge 企业级 AI Agent 平台（Python）

**一句话：** 输入产品想法 → 九阶段造物编排；底层 **企业知识库 RAG + 查证型知识库 + DeepResearch**，可追溯、可核验、可 eval。

```text
Web 工作台 (Next.js)
       ↓
ProjectForge Supervisor（九阶段）
       ├── ① DeepResearch（外网 + KB，脚注报告）
       ├── ② 企业知识库 RAG（混合检索 + citation + 拒答）
       └── ③ 查证型知识库（Claim-Evidence，架构/PRD 门控）
       ↓
FastAPI · 81+ 单测 · Eval Dashboard · Docker Compose
```

**完成度（2026-07-08）：** 四模块 MVP 可演示；**公网部署暂缓**；**第 1 个月重点：agent 课程 + harness-agent 建设**，简历投递暂缓。

详细技术报告：[docs/19-project-completion-report.md](docs/19-project-completion-report.md)  
演示脚本：[docs/demo-scripts.md](docs/demo-scripts.md)  
开发日程：[docs/18-project-first-daily-plan.md](docs/18-project-first-daily-plan.md)

---

## 六、Agent 执行规则

每次接到任务时：

1. **先读本文** → [docs/00-document-index.md](docs/00-document-index.md) 找文档  
2. 课程只引用 `../../agent/`；Harness 在 `../../harness-agent/`；作品集在 `work/ai-agent/`  
3. 新功能优先 Python / `portfolio/agent-platform/` 或 `harness-agent/`，**不为求职叙事新增 Java 模块**  
4. 简历/BOSS/面试材料：**第 1 个月暂缓使用**；材料见 [docs/11-resume-and-interview-pack.md](docs/11-resume-and-interview-pack.md)  
5. 不要主动 git commit，除非用户明确要求  
6. 用户要求「继续 / 全部完成」时，以 **学习 agent 课程 + 建设 harness-agent** 为最高优先级  

---

## 七、当前阶段与下一步

> ⏸ **第 1 个月（至 2026-08-05）：不投简历、不 BOSS。**  
> ⏸ **公网部署（HTTPS）暂缓**，备注为求职最后阶段。

| 优先级 | 动作 | 产出 | 状态 |
|---|---|---|---|
| **P0** | 按 W1–W6 排期学习 `agent/` 课程 | 知识点表 §8.1 打勾 | 🔄 进行中 |
| **P0** | **harness-agent** 跑通第一个真实 side project | `../../harness-agent/` | 🔄 MVP 已迁 |
| **P0** | ProjectForge 单测 + eval 保持绿 | 81+ unittest、eval 100% | ✅ |
| P1 | 案例11 ↔ 查证模块对照加深 | `docs/20-case11-verified-knowledge-interview-map.md` | ✅ 已建 |
| P1 | Harness ①～⑤ 阶段产物完整走通 | `hstack gate/advance` | 待做 |
| P2 | 官方 LangGraph 并行 demo | ADR 0002 迁移 | 待做 |
| **暂缓** | 简历投递、BOSS、Mock 面试 | `logs/applications/` | ⏸ 1 个月后 |
| **最后** | 公网部署（云服务器 + HTTPS） | 可分享 demo URL | ⏸ 暂缓 |

---

## 八、学习排期总表（6 周 · 学习 + Harness 并行，不投简历）

> **每天默认 3～4h**：45～90min 课程输入 + 90～150min 工程输出 + 10min 日志。  
> **本阶段禁止**：BOSS 投递、改简历发出去、Mock 面试安排。  
> 详细日计划见 [docs/18-project-first-daily-plan.md](docs/18-project-first-daily-plan.md)（需同步改为学习期版）。

### 8.1 知识点全清单（按求职 P0 排序）

| # | 知识点 | 掌握标准（能面试讲清） | 课程 part | 仓库对照 | 状态 |
|---|---|---|---|---|---|
| 1 | FastAPI 服务化 | 路由、Pydantic、SSE、健康检查 | part10 | `api.py` | ✅ |
| 2 | RAG 切分与入库 | PDF/MD 解析、chunk 策略 | part05 | `document_parser.py` | ✅ |
| 3 | 混合检索 | BM25 + 向量 + rerank 思路 | part05 | `retrieval.py` | ✅ |
| 4 | Qdrant 向量库 | upsert、query、citation | part05 | `vector_store.py` | ✅ |
| 5 | Citation 与拒答 | 无证据不答、trace 回放 | part05、part13 | `agent.py` eval 30 条 | ✅ |
| 6 | Prompt 安全 | 注入拦截、safety_blocked | part03、part11 | `safety.py` | ✅ |
| 7 | OpenAI 兼容 API | chat + embedding 适配 | part01 | `llm.py`、`embeddings.py` | ✅ |
| 8 | Agent 评估 | pass_rate、refusal、MRR | part13 | `agent-eval-dashboard/` | ✅ |
| 9 | Claim-Evidence 查证 | 文档审核式对齐、门控 | part22 案例11/12 | `verified_knowledge.py` | ✅ |
| 10 | DeepResearch | 子问题 + 外网 + 脚注 | part22 案例4 | `deep_research.py` | ✅ |
| 11 | 多 Agent 编排 | Supervisor、九阶段 | part14 | `project_forge.py` | ✅ |
| 12 | LangGraph 官方 | 与自研状态机对比 | part04 | ADR 0002 待写 | 🔄 |
| 13 | Docker 部署 | compose、健康检查 | part12 | `compose.yaml` | ✅ |
| 14 | 上下文 / Memory | session、压缩策略 | part08、part09 | `session.py` | 🔄 |
| 15 | Harness 工程化 | 阶段门、产物、CLI | part19、part24 | `harness-agent/` | 🔄 |
| 16 | MCP / 工具契约 | OpenAPI、stdio server | part07、part17 | `mcp-tool-server/` | ✅ |
| 17 | 测试闭环 | 单测、eval、E2E 思路 | part13 + shuang-chain | unittest 81+ | 🔄 |
| 18 | 公网 HTTPS 部署 | 云服务器、域名、CORS | part12 | ⏸ 最后阶段 | ⏸ |

图例：✅ 已有作品证据 · 🔄 进行中/需加深 · ⏸ 暂缓

### 8.2 六周排期（2026-07-05 起）

| 周 | 主题 | 学习（agent/） | 工程输出 | Harness 里程碑 |
|---|---|---|---|---|
| **W1** | RAG 面试闭环 | part05 复习、part13 eval | 跑通 eval 100%；熟记 demo 脚本 | `hstack init` 第一个 run |
| **W2** | 查证 + 案例11 | part22 案例11/12 | 读 `docs/20-case11-...`；加深 verified_knowledge | 完成 research + prototype 阶段 gate |
| **W3** | LangGraph + 编排 | part04 LangGraph | ADR 0002；对比 `graph_orchestrator.py` | 完成 architecture + solution 阶段 |
| **W4** | DeepResearch + Forge | part22 案例4、part14 | Forge 第二轮 demo；外网 key 配置 | 完成 prd + development 阶段 |
| **W5** | Harness 工程 | part19、shuang-flow | **hstack** 跑完 side project ①～⑦ 阶段 | 测试 + 部署产物模板填完 |
| **W6** | 测试 + 复盘 | part12、shuang-chain 概念 | Harness ⑧～⑨ 阶段；compose 稳定性 | 第一个 side project 全链路 retro |

### 8.3 每日最小学习包（忙时 45min）

```text
Mon  RAG 八股（part05 一节） + 复述 citation/拒答
Tue  查证（案例11 notebook 30min） + verified_knowledge 代码 15min
Wed  Eval（part13 一节） + 看 latest eval 报告
Thu  FastAPI（part10 一节） + curl 打 /ask
Fri  ProjectForge（part14 一节） + Web 工作台点一遍
Sat  Harness（part19 或 hstack brief） + 写 1 个 stage 产物
Sun  周复盘 logs/weekly + 对照 §8.1 知识点打勾
```

---

## 九、Harness Agent 工程（gstack 类 AI 交付流水线）

> **代码：** [../../harness-agent/README.md](../../harness-agent/README.md)  
> **命令：** `hstack`（类似 gstack，覆盖全生命周期而非仅 QA）

### 9.1 是什么

**Harness Agent** = 你用 AI 做**任意新产品**时的本地驾驶舱：

```text
产品想法
  → hstack init
  → 九阶段产物目录（research … retro）
  → hstack brief（生成给 Cursor 的交接 prompt）
  → 填产物 / AI 生成
  → hstack gate（阶段门禁）
  → hstack advance（进入下一阶段）
  → 最终可部署仓库 + 文档包
```

与 **ProjectForge** 分工：

| 组件 | 用途 |
|---|---|
| **ProjectForge**（agent-platform） | 简历 demo：RAG + 查证 + DeepResearch + Web 工作台 |
| **Harness Agent**（harness-agent/） | 你私人用：从 0 做新项目，阶段门 + 文件产物 + CLI |

与 **gstack** 类比：gstack `/qa` 偏 diff-aware E2E；**hstack** 偏 **需求→交付** 全链路，测试阶段可对齐 `shuang-chain`。

### 9.2 快速命令

```bash
cd ../../harness-agent
.venv/bin/pip install -e .

# 在你的新项目根目录
hstack init "某某 SaaS MVP"
hstack list
hstack brief --run-id <run-id> --stage research   # 复制到 Cursor
hstack gate --run-id <run-id> --stage research
hstack advance --run-id <run-id> --stage research
hstack pipeline                                   # 看九阶段
```

### 9.3 九阶段 ↔ Cursor Skill 映射

| 阶段 | 建议 Skill |
|---|---|
| ① 调研 | `shuang-research` / DeepResearch |
| ② 原型 | `shuang-design` |
| ③④ 架构/方案 | `shuang-arch` + 查证 |
| ⑤ PRD | `shuang-prd` / `speckit-specify` |
| ⑥ 开发 | `shuang-tdd` / `speckit-implement` |
| ⑦ 测试 | `shuang-router` → `shuang-chain` |
| ⑧ 部署 | part12 Docker |
| ⑨ 复盘 | `session-learn` |

### 9.4 Roadmap

- [ ] `hstack run --stage X` 调用 ProjectForge API 自动生成
- [ ] 与 `specs/` Spec-Kit 双向同步
- [ ] Web 仪表盘（复用 agent-web）

---

## 十、相关文档索引

| 文档 | 用途 |
|---|---|
| [docs/11-resume-and-interview-pack.md](docs/11-resume-and-interview-pack.md) | 简历话术、BOSS、面试（⏸ 第 2 个月再用） |
| [logs/applications/resume-李爽-python-ai.md](logs/applications/resume-李爽-python-ai.md) | 李爽完整简历（暂缓投递） |
| [docs/08-job-market-hangzhou.md](docs/08-job-market-hangzhou.md) | 杭州岗位画像（⏸ 暂缓） |
| [docs/09-job-skills-matrix.md](docs/09-job-skills-matrix.md) | 90+ 技能矩阵 |
| [docs/17-project-forge-master-plan.md](docs/17-project-forge-master-plan.md) | ProjectForge 架构 |
| [docs/20-case11-verified-knowledge-interview-map.md](docs/20-case11-verified-knowledge-interview-map.md) | 案例11 ↔ 查证模块 |
| [../../harness-agent/README.md](../../harness-agent/README.md) | **Harness Agent CLI（gstack 类）** |
| [docs/18-project-first-daily-plan.md](docs/18-project-first-daily-plan.md) | 6 周日计划详表 |
| [logs/applications/boss-application-tracker.md](logs/applications/boss-application-tracker.md) | BOSS 投递跟踪（⏸ 暂缓） |

---

## 十一、运行命令

```bash
cd work/ai-agent
docker compose up --build          # Web :3000  API :8000
cd portfolio/agent-platform && .venv/bin/python -m unittest discover -s tests -v
python3 scripts/completion_gate.py --root .

# Harness Agent
cd ../../harness-agent && .venv/bin/pip install -e .
hstack init "我的新产品想法"
```
