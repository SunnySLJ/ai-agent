# 20 案例11 文档审核 ↔ 查证型知识库（面试一页纸）

> 更新：2026-07-05  
> 课程：`../../agent/part22-agent-workspace/【加餐】案例11：LangChain v1.0 文档审核类v1.0Agent开发实战/`  
> 工程：`portfolio/agent-platform/src/agent_platform/verified_knowledge.py`  
> 演示：`POST /verified-knowledge/verify` · ProjectForge 架构/PRD 阶段查证面板

---

## 一、30 秒怎么讲

> 课程案例11 是 LangChain **文档审核 Agent**：从文档抽 claim，用 RAG 找 evidence，判断能否通过。  
> 我在 ProjectForge 里做了 **查证型知识库**：同样的 Claim-Evidence 思路，但用 FastAPI 服务化、加了置信度门控和 eval，并接到 Forge 架构/PRD 阶段的**查证门**——不通过就不进开发。

---

## 二、概念对照表

| 案例11（LangChain 文档审核） | 本项目（verified_knowledge） | 代码/API |
|---|---|---|
| 待审核文档 / 段落 | 输入 `text`（架构 ADR、PRD 等） | `POST /verified-knowledge/verify` |
| 抽取审核点 / claim | `extract_claims()`（规则切分 + 可选 LLM） | `verified_knowledge.py` |
| 知识库检索 evidence | `HybridRetriever` Top-K | `verify_claims()` |
| 支持 / 矛盾 / 不确定 | `supports` / `contradicts` / `partial` / `unrelated` | `ClaimEvidenceRelation` |
| 审核结论 | `verified` / `pending_review` / `unverified` / `contradicted` | `VerifiedClaimStatus` |
| 整体能否放行 | 报告级 `should_refuse` | `VerificationReport` |
| 人工复核（案例12 HITL） | `pending_review` 状态 | Web 查证面板标黄 |
| 审核工作流 / Agent | ProjectForge ③④⑤ 阶段自动查证 | `project_forge.py` |
| 评估指标 | verification eval 8 条 JSONL | `data/verification_eval_dataset.jsonl` |

---

## 三、流程对照（面试可画）

**案例11 典型流程：**

```text
文档 → 抽 claim → RAG 检索 → LLM/规则判定 → 审核报告 →（可选 HITL）
```

**本项目流程：**

```text
阶段产物 markdown → extract_claims → HybridRetriever → 对齐分+关系
  → 置信度门控 → VerificationReport → should_refuse?
  → Forge 架构/PRD 阶段展示对照表
```

详细流程图：[verified-knowledge-flow.md](../portfolio/agent-platform/docs/verified-knowledge-flow.md)

---

## 四、你的差异化（比「只跟课程做 demo」多什么）

| 点 | 说明 |
|---|---|
| 工程化 | FastAPI + 93 单测 + eval JSONL，不是 notebook 一次性 |
| 编排集成 | 嵌入 ProjectForge 九阶段，架构/PRD **必经查证门** |
| 可配置门控 | `verify_threshold` / `refuse_threshold` 可调 |
| 与 RAG 分工 | 普通问答走 citation；**高-risk 断言**走 Claim-Evidence |
| 案例12 方向 | `pending_review` + HITL 审批可对接 `approval.py` 模式 |

---

## 五、本地演示（无需公网）

```bash
cd work/ai-agent && docker compose up --build
```

**API：**

```bash
curl -X POST http://127.0.0.1:8000/verified-knowledge/verify \
  -H 'Content-Type: application/json' \
  -d '{"text":"查证型知识库通过 Claim-Evidence 对齐降低幻觉。","source_stage":"architecture"}'
```

**Web：** ProjectForge 工作台 → 运行九阶段 → 点「③ 架构选项」→ 右侧查证面板

---

## 六、高频追问标准答

**Q：和 RAG citation 有什么区别？**  
Citation 是「回答时贴来源」；查证是「对**已有主张**逐条对齐 evidence，并给出 verified/contradicted/pending_review，适合文档审核和 ADR 门控。

**Q：claim 怎么抽？**  
默认句子规则切分；有 `OPENAI_API_KEY` 时 `use_llm=true` 走 LLM JSON 抽取（对标案例 ReAct/结构化输出）。

**Q：对齐分怎么算？**  
claim 与 evidence 术语 F1 式 overlap → 关系判定 → 加权置信度 → 与门控比较。

**Q：为什么不用 LangChain 官方实现？**  
第一个月优先 **可测试、可 eval、可部署** 的轻量实现；概念与案例11 一致，P1 可迁 LangGraph（见 ADR 0002）。

---

## 七、案例12 延伸（了解即可）

案例12 在 v1.1 上加了 **HITL 人机交互审核**。本项目对应：

- `pending_review` → 人工复核队列（Web 已展示）
- `approval.py` 模式 → 写操作 HITL，可类比「审核员确认后放行」

---

## 八、相关文档

- [11-resume-and-interview-pack.md](11-resume-and-interview-pack.md) — Q6 文档审核  
- [shuang-plan.md](../shuang-plan.md) — agent 资料库  
- [07-source-map.md](07-source-map.md) — part22 映射  
