# W2 学习笔记：查证型知识库 + 案例11 文档审核

> 来源：part22 案例11/12 + `docs/20-case11-verified-knowledge-interview-map.md`  
> 对照代码：`portfolio/agent-platform/src/agent_platform/verified_knowledge.py`  
> 日期：2026-07-05（第 2 周 · 查证 + 案例11）

---

## 一、30 秒面试版

> 课程案例11 是 LangChain **文档审核 Agent**：从文档抽 claim，用 RAG 找 evidence，判断能否通过。  
> 我在 ProjectForge 里做了 **查证型知识库**：同样的 Claim-Evidence 思路，FastAPI 服务化、置信度门控、eval，并接到 Forge 架构/PRD 阶段的**查证门**——不通过就不进开发。

---

## 二、RAG 问答 vs 查证型知识库

| 维度 | 企业 RAG（问答） | 查证型知识库（文档审核） |
|------|-----------------|------------------------|
| 输入 | 用户问题 | 待审核文档/段落（ADR、PRD） |
| 输出 | 带 citation 的回答 | 每条 claim 的 verified/contradicted/pending_review |
| 核心动作 | 检索 → 生成 | 抽 claim → 检索 evidence → 对齐判定 |
| 拒答逻辑 | 无证据不答 | `should_refuse` 门控，整体不放行 |
| 适用场景 | 知识库问答 | 架构/PRD 事实核验、文档审核 |

**一句话**：Citation 是「回答时贴来源」；查证是「对已有主张逐条对齐 evidence」。

---

## 三、核心数据模型（必背）

```text
Claim（主张）
  → HybridRetriever 检索 Evidence（证据片段）
  → ClaimEvidenceLink（supports / partial / contradicts / unrelated）
  → VerifiedClaim（status + confidence）
  → VerificationReport（整体 should_refuse?）
```

### 状态枚举

| 状态 | 含义 | 面试怎么说 |
|------|------|-----------|
| `verified` | 置信 ≥ verify_threshold | 有充分证据支持 |
| `pending_review` | refuse ≤ 置信 < verify | 需人工复核（对标案例12 HITL） |
| `unverified` | 置信 < refuse_threshold | 证据不足 |
| `contradicted` | 存在矛盾 evidence | 直接拦截 |

### 门控配置（VerificationConfig）

| 参数 | 默认值 | 作用 |
|------|--------|------|
| `verify_threshold` | 0.55 | 达到即 verified |
| `refuse_threshold` | 0.35 | 低于即 unverified；中间 pending_review |
| `min_evidence_score` | 0.15 | 检索结果最低分过滤 |
| `evidence_limit` | 3 | 每条 claim 检索 Top-K |
| `contradiction_penalty` | 0.25 | 矛盾证据扣分 |

---

## 四、完整流程（面试可画）

```text
阶段产物 markdown
  → extract_claims（规则切句 / 可选 LLM JSON）
  → HybridRetriever 为每条 claim 检索 evidence
  → _alignment_score（术语 F1 式 overlap）
  → _relation_for（supports / partial / contradicts / unrelated）
  → 加权置信度 + 门控比较
  → VerificationReport（should_refuse?）
  → Forge 架构/PRD 阶段展示查证面板
```

**案例11 典型流程（课程）：**

```text
文档 → 抽 claim → RAG 检索 → LLM/规则判定 → 审核报告 →（可选 HITL）
```

两者架构一致，本项目多了：FastAPI、eval、Forge 九阶段集成。

---

## 五、课程 ↔ 代码对照表

| 案例11（LangChain 文档审核） | 本项目 | 代码/API |
|---|---|---|
| 待审核文档 | 输入 `text`（架构 ADR、PRD） | `POST /verified-knowledge/verify` |
| 抽取 claim | `extract_claims()` | `verified_knowledge.py` |
| RAG 检索 evidence | `HybridRetriever` Top-K | `verify_claims()` |
| 支持/矛盾/不确定 | `supports/contradicts/partial/unrelated` | `ClaimEvidenceRelation` |
| 审核结论 | verified/pending_review/unverified/contradicted | `VerifiedClaimStatus` |
| 整体放行 | `should_refuse` | `VerificationReport` |
| 人工复核（案例12） | `pending_review` | Web 查证面板标黄 |
| 评估 | verification eval 8 条 | `verification_eval_dataset.jsonl` |

---

## 六、对齐分怎么算？（面试高频）

1. **术语提取**：claim 与 evidence 各自抽 ASCII + 中文 2～8 字词
2. **F1 式 overlap**：`2 * recall * precision / (recall + precision)`
3. **关系判定**：
   - overlap < 0.12 → unrelated
   - 含矛盾词（「不是」「并非」）且 overlap ≥ 0.2 → contradicts
   - overlap ≥ 0.45 → supports
   - overlap ≥ 0.2 → partial
4. **置信度**：`alignment * evidence.score`，矛盾时扣 `contradiction_penalty`
5. **门控**：与 verify/refuse threshold 比较定 status

---

## 七、与 ProjectForge 的集成

```text
ProjectForge 九阶段
  ├── ① DeepResearch
  ├── ② 企业 RAG
  └── ③ 查证型知识库  ← 架构/PRD 阶段必经
        should_refuse=true → 阻断进入开发
        pending_review → 人工复核后放行
```

**差异化（比课程 demo 多什么）：**

- 工程化：FastAPI + 93 单测 + eval JSONL
- 编排集成：嵌入九阶段查证门
- 可配置门控：threshold 可调
- 与 RAG 分工：问答走 citation；高-risk 断言走 Claim-Evidence

---

## 八、本地演示

```bash
cd work/ai-agent && docker compose up --build

curl -X POST http://127.0.0.1:8000/verified-knowledge/verify \
  -H 'Content-Type: application/json' \
  -d '{"text":"查证型知识库通过 Claim-Evidence 对齐降低幻觉。","source_stage":"architecture"}'
```

Web：ProjectForge 工作台 → 九阶段 → 「③ 架构选项」→ 右侧查证面板

---

## 九、面试必答

**Q: 和 RAG citation 有什么区别？**  
Citation 是回答时贴来源；查证是对已有主张逐条对齐 evidence，输出 verified/contradicted/pending_review，适合文档审核和 ADR 门控。

**Q: claim 怎么抽？**  
默认按句子规则切分（≥12 字）；有 API key 时 `use_llm=true` 走 LLM JSON 抽取（对标案例结构化输出）。

**Q: 为什么不用 LangChain 官方实现？**  
第一个月优先可测试、可 eval、可部署的轻量实现；概念与案例11 一致，P1 可迁 LangGraph（ADR 0002）。

**Q: 案例12 HITL 怎么对应？**  
`pending_review` → 人工复核队列；`approval.py` 模式可类比「审核员确认后放行」。

---

## 十、W2 学习检查清单

- [ ] 能画 Claim-Evidence 流程图
- [ ] 能讲清 4 种 relation + 4 种 status
- [ ] 能解释 verify_threshold vs refuse_threshold
- [ ] 能 demo `/verified-knowledge/verify`
- [ ] 能讲案例11 → 我项目的映射（30 秒版）
- [ ] Harness：research + prototype gate 通过

---

*下一步：W3 LangGraph 官方 + ADR 0002 对比 `graph_orchestrator.py`*
