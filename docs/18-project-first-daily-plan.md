# 18 项目优先：6 周每日学习与开发计划

> 编制日期：2026-07-01  
> 周期：42 天（6 周）  
> 原则：**先做完四个项目，暂不管求职投递**  
> 关联：[17-project-forge-master-plan.md](17-project-forge-master-plan.md) · [07-source-map.md](07-source-map.md)

---

## 一、每天怎么开始（固定流程）

```text
1. 打开本文 → 找到「今天 = 第 X 天」
2. 打开 docs/07-source-map.md → 定位 agent/ 课件路径
3. 学习 45～90 分钟（输入）
4. 在 work/ai-agent 写代码/文档 90～150 分钟（输出）
5. 跑测试：
   cd portfolio/agent-platform && .venv/bin/python -m unittest discover -s tests -v
6. 写日志（建议）：logs/daily/YYYY-MM-DD.md
```

**默认投入**：3～4 小时/天。工作忙时最小版本：45 分钟学习 + 30 分钟代码 + 10 分钟日志。

**求职相关全部暂停**：BOSS 投递、简历改版、模拟面试 — 等四个项目 Phase 完成后再启动。原 30 天冲刺见 [02-30-day-sprint.md](02-30-day-sprint.md)（参考用）。

---

## 二、资料库位置（两套，不要混）

| 类型 | 绝对路径 | 用途 |
|---|---|---|
| **课程资料库（只读）** | `/Users/mac/Desktop/shuang-kuai/shuang-agent/agent/` | 每天学习：notebook、课件、案例源码 |
| **工程项目库（读写）** | `/Users/mac/Desktop/shuang-kuai/shuang-agent/work/ai-agent/` | 写代码、文档、测试、部署 |

课程目录速查：

```text
part01  LLM API           part09  上下文工程
part02  本地模型           part10  FastAPI
part03  Agent 基础         part11  设计部署
part04  LangChain/Graph    part12  Docker
part05  RAG ★              part13  评估 ★
part06  LlamaIndex         part14  多智能体 ★
part07  Skills/MCP ★       part22  综合案例(含 DeepResearch) ★
part08  Memory             part19-25 Harness/OpenClaw
```

---

## 三、四个项目与完成顺序

| 顺序 | 项目 | 代码位置 | 当前进度 | 完成周 |
|---|---|---|---|---|
| 1 | 企业知识库 RAG | `portfolio/agent-platform/` | ~85% | 第 1 周 |
| 2 | 查证型知识库 | `verified_knowledge.py` | ~50% | 第 2 周 |
| 3 | ProjectForge 造物智能体 | `project_forge.py` + Web 工作台 | ~40% | 第 3～5 周 |
| 4 | DeepResearch Agent | `capabilities/deep-research/`（待建） | 0% | 第 4 周 |

```text
企业知识库（底座）→ 查证型知识库 → ProjectForge 九阶段编排 → DeepResearch 接入调研阶段
```

---

## 四、项目 ↔ 课程 ↔ 产出物对照

| 项目 | 必学课程（agent/） | 关键产出物 |
|---|---|---|
| 企业知识库 | part05, part10, part12, part13 | eval-dataset、Rerank 说明、LangGraph、部署 README |
| 查证型知识库 | part05 溯源, part22 文档审核 | LLM claim 抽取、查证 eval、Web 对照表 |
| ProjectForge | part14, part11, part19 | Supervisor、各阶段真 Agent、端到端小项目 |
| DeepResearch | part22/案例4 | 搜索 API、query planner、脚注报告、接入阶段① |

---

## 五、第 1 周：夯实企业知识库（项目 1）

**目标**：RAG 全链路文档 + 评估闭环补齐。

| 天 | 学什么（agent/） | 做什么（work/ai-agent/） | 产出物 |
|---|---|---|---|
| **D1** | `part05/Part 5 检索生成和评估` 复习；`part13-agent-score` | 编写 eval 数据集说明 | `portfolio/agent-eval-dashboard/eval-dataset.md` ✅ |
| **D2** | `part13` 评估指标（命中率、MRR、拒答率） | 扩展 eval 到 30 条；补失败分类 | eval JSON/MD 更新 ✅ |
| **D3** | `part05/Part 4 向量库` 复习 | 写 Rerank 策略文档（BM25+向量融合 → cross-encoder 路线） | `docs/rerank-strategy.md` 或 portfolio 内文档 ✅ |
| **D4** | `part04-agent-langchain` LangGraph 章节 | 接入官方 LangGraph 或写自研 vs 官方 ADR | `docs/decisions/0002-langgraph.md` ✅ |
| **D5** | `part10-agent/智能体项目开发必备基础FastAPI.ipynb` | 补 API OpenAPI 注释与接口说明 | `notes-fastapi.md` 更新 ✅ |
| **D6** | `part12-agent-docker` | 优化 compose 健康检查；README 部署章 | 根 README + compose 注释 ✅ |
| **D7** | 周复盘 | 项目 1 自测清单；`docker compose up` 全链路 | `logs/weekly/2026-week-project-1.md` ✅ |

**第 1 周完成标准**：

- [x] eval-dataset.md 存在且 ≥30 条样本说明
- [x] 全量 unittest 绿
- [x] docker compose 一键启动 Web + API

---

## 六、第 2 周：加深查证型知识库（项目 2）

**目标**：从「有 citation」升级到「Claim-Evidence 可核验」。

| 天 | 学什么 | 做什么 | 产出物 |
|---|---|---|---|
| **D8** | `part05` 答案溯源与引用章节 | 读 `verified_knowledge.py`；画 Claim-Evidence 流程图 | `portfolio/agent-platform/docs/verified-knowledge-flow.md` ✅ |
| **D9** | `part22/案例12 文档审核Agent`（规则+RAG+溯源） | 架构/PRD 阶段 API 强制查证门 | API 中间件或 stage 钩子 ✅ |
| **D10** | `part03` ReAct / 结构化 JSON 输出 | LLM 抽取 claim（替换纯句子切分） | `verified_knowledge.py` LLM 路径 ✅ |
| **D11** | `part13` 评估设计 | verification eval：verified_rate、refusal_rate | `test_verified_knowledge.py` 扩展 ✅ |
| **D12** | `part11-agent-design` | Web 查证对照表 UI 完善 | `ProjectForgeWorkbench` 查证面板增强 ✅ |
| **D13** | `part22` HITL 审核 | 低置信主张 → `pending_review` 状态 | `VerifiedClaimStatus` 扩展 ✅ |
| **D14** | 周复盘 | 演示：输入架构断言 → 证据对齐表 | 周复盘日志 |

**第 2 周完成标准**：

- [x] `POST /verified-knowledge/verify` 支持 LLM claim 抽取（有 key 时）
- [x] Web 可展示 claim-evidence 对照
- [x] verification 相关测试 ≥8 条

---

## 七、第 3 周：ProjectForge 阶段自动化（项目 3）

**目标**：九阶段从「演示模板」→「半真实多 Agent」。

| 天 | 学什么 | 做什么 | 产出物 |
|---|---|---|---|
| **D15** | `part14-agent-help` Router/Supervisor | 实现 Forge Supervisor 路由 | `forge_supervisor.py` ✅ |
| **D16** | `part04` Plan-and-Execute | 阶段 ①② 调研+原型 Agent（LLM 生成） | research + prototype agent ✅ |
| **D17** | `part11` 接口与模块设计 | 阶段 ③④⑤ 架构/方案/PRD Agent + 查证门 | arch/prd agent ✅ |
| **D18** | `part07-agent-skills` Skill 系统 | Dev Agent Code Constitution Skill | `.codex/skills/` 或项目内 skill |
| **D19** | `part19-agent-harness` | 阶段 ⑥⑦ Dev + QA Agent 接 TDD | dev/qa agent stub |
| **D20** | `part12` Docker/CI | 阶段 ⑧ DevOps Agent 输出 compose 片段 | devops agent |
| **D21** | 周复盘 | 用「小型待办 API」跑完九阶段 | 端到端演示记录 |

**第 3 周完成标准**：

- [x] Supervisor 可路由 ≥4 个阶段 Agent
- [x] 至少 1 条真实小项目走完九阶段
- [x] 每阶段产出物落盘到 `project-forge/artifacts/`

---

## 八、第 4 周：DeepResearch 接入（项目 4）

**目标**：ProjectForge 阶段 ① 输出带脚注的调研报告。

| 天 | 学什么 | 做什么 | 产出物 |
|---|---|---|---|
| **D22** | `part22/案例4 DeepResearch+Agent` **精读** | 建 `capabilities/deep-research/` 骨架 | 模块目录 + README ✅ |
| **D23** | 案例4 多步搜索章节 | 接搜索 API（Tavily / Serper / 博查 选一） | 内部 KB MVP ✅（P1 外网） |
| **D24** | `part03` 子问题拆解 Prompt | query planner（3～5 子问题） | `deep_research.py` ✅ |
| **D25** | `part05` 多源综合 | 报告生成 + 脚注结构 | `deep_research.py` ✅ |
| **D26** | `part13` 评估 | DeepResearch eval：引用覆盖率 | eval 用例 ✅ |
| **D27** | `part14` 多 Agent | 调研 Agent 接入 Forge 阶段 ① | API + Web 联动 ✅ |
| **D28** | 周复盘 | 演示：行业问题 → 脚注报告 → 进 PRD | 周复盘日志 |

**第 4 周完成标准**：

- [x] `POST /deep-research/run` 或等价 API 可返回脚注报告
- [x] ProjectForge 阶段 ① 调用 DeepResearch
- [x] 至少 3 条调研 eval 样本

---

## 九、第 5 周：Memory + Context + 多 Agent 完善

**目标**：跨阶段上下文不丢失，Forge 可连续迭代同一项目。

| 天 | 学什么 | 做什么 | 产出物 |
|---|---|---|---|
| **D29** | `part08-agent-memory` | Forge run session + 阶段产物持久化 | `forge_store.py` ✅ |
| **D30** | `part09-agent-context` | 长 PRD 进 Dev 前上下文压缩 | context summarizer |
| **D31** | `part21-agent-openclaw-memory` | 项目 ADR 决策入库（长期记忆） | ingest ADR 到知识库 |
| **D32** | `part14` Worker 并行 | Architect/Dev 并行草案 + Supervisor 合并 | 并行编排 POC |
| **D33** | `part16-agent-skill-super` | 各阶段 Skill 规范化 | skill 清单文档 |
| **D34** | `part25 OpenClaw专题` 上下文 | 多轮 Forge 运行体验优化 | Web UX 改进 |
| **D35** | 周复盘 | 同一项目跑第二轮，验证记忆有效 | 周复盘日志 |

**第 5 周完成标准**：

- [x] Forge run 可恢复（session_id / run_id 持久化）
- [x] 第二轮运行能引用第一轮 ADR/PRD
- [x] 全量测试仍绿

---

## 十、第 6 周：整合、压测、文档封顶

| 天 | 做什么 | 产出物 |
|---|---|---|
| **D36** | 四项目联调：DeepResearch → 知识库 → 查证 → Forge | 联调 checklist |
| **D37** | 全量测试 + CI + `completion_gate.py` | 门禁 Complete: yes |
| **D38** | 写四项目完成报告 | `docs/19-project-completion-report.md` ✅ |
| **D39** | 每个项目 5 分钟演示脚本 | `docs/demo-scripts.md` ✅ |
| **D40** | 公网部署（云服务器 + 域名 + HTTPS） | 线上 URL |
| **D41** | 总复盘；定下个月增强 backlog | `logs/weekly/2026-project-phase-done.md` |
| **D42** | 休息 / 补洞 / 代码清理 | — |

**第 6 周完成标准**：

- [x] 四个项目均可独立演示
- [x] 文档 17 + 18 + 19 齐全
- [x] 测试 ≥80 条且全绿（随开发递增）

---

## 十一、从今天开始（接续点）

若今天为 **2026-07-01**，从 **第 1 周 D1** 开始：

| 项 | 内容 |
|---|---|
| **学** | `agent/part13-agent-score` + 复习 `part05/Part 5` |
| **做** | 创建 `portfolio/agent-eval-dashboard/eval-dataset.md` |
| **测** | `python -m unittest discover -s tests -v` |
| **记** | `logs/daily/2026-07-01.md` |

> 已完成的工作（不需重做）：企业知识库核心、ProjectForge Phase A、查证数据结构、76 测试、书籍→公众号。从 D1 起是**补洞 + 加深**，不是从零开始。

---

## 十二、日历速查（按启动日推算）

| 周次 | 天数 | 日历（自 2026-07-01 起） | 主题 |
|---|---|---|---|
| 第 1 周 | D1–D7 | 07-01 ～ 07-07 | 企业知识库 |
| 第 2 周 | D8–D14 | 07-08 ～ 07-14 | 查证型知识库 |
| 第 3 周 | D15–D21 | 07-15 ～ 07-21 | ProjectForge 自动化 |
| 第 4 周 | D22–D28 | 07-22 ～ 07-28 | DeepResearch |
| 第 5 周 | D29–D35 | 07-29 ～ 08-04 | Memory/Context |
| 第 6 周 | D36–D42 | 08-05 ～ 08-11 | 整合与封顶 |

---

## 十三、关联文档

| 文档 | 何时读 |
|---|---|
| [00-document-index.md](00-document-index.md) | 找任何文档 |
| [07-source-map.md](07-source-map.md) | 每天定位课件 |
| [17-project-forge-master-plan.md](17-project-forge-master-plan.md) | 理解四项目架构 |
| [16-master-implementation-plan.md](16-master-implementation-plan.md) | 工程 Feature 进度 |
| [02-30-day-sprint.md](02-30-day-sprint.md) | 参考（求职部分暂跳过） |
| [templates/T01-daily-log.md](templates/T01-daily-log.md) | 写每日日志 |

---

## 十四、运行命令备忘

```bash
# 全栈演示
cd work/ai-agent && docker compose up --build

# 单测
cd portfolio/agent-platform && .venv/bin/python -m unittest discover -s tests -v

# 完成门禁
python3 scripts/completion_gate.py --root .

# Web
open http://127.0.0.1:3000   # ProjectForge 工作台默认 Tab

# API 文档
open http://127.0.0.1:8000/docs
```
