# 19 四项目阶段完成报告

> 日期：2026-07-08 · 对应 `18-project-first-daily-plan.md` D36–D38 提前汇总

## 总览

| 项目 | 完成度 | 可演示 |
|---|---:|---|
| 企业知识库 RAG | 90% | ✅ |
| 查证型知识库 | 75% | ✅ |
| ProjectForge 造物智能体 | 70% | ✅ |
| DeepResearch | 65% | ✅ |

核心叙事：**ProjectForge 编排全链路，三能力引擎（企业 KB / 查证 / DeepResearch）作为阶段燃料。**

## 1. 企业知识库 RAG

- HybridRetriever（BM25 + 向量 + 规则 Rerank）
- eval 30 条 + retrieval 8 条
- 文档：`rerank-strategy.md`、`eval-dataset.md`、ADR `0002-langgraph.md`

## 2. 查证型知识库

- `verified_knowledge.py`：Claim / Evidence / VerificationReport
- 状态：`verified` / `pending_review` / `unverified` / `contradicted`
- LLM claim 抽取（`use_llm=true` 且有 API key）
- API：`POST /verified-knowledge/verify`
- eval：`verification_eval_dataset.jsonl`（8 条）
- 文档：`verified-knowledge-flow.md`

## 3. ProjectForge

- 九阶段演示：`POST /project-forge/demo`
- Supervisor 路由：`forge_supervisor.py` + `/project-forge/stages`
- 持久化：`forge_store.py` + `/project-forge/runs`
- Artifacts：`project-forge/artifacts/{run_id}/`
- Web：`ProjectForgeWorkbench.tsx`

## 4. DeepResearch

- `deep_research.py` + `web_search.py`：Tavily/Serper 外网 + 内部 KB 混合
- API：`POST /deep-research/run`（`use_web_search`）
- Forge 第二轮：`prior_run_id` 继承 ADR/PRD
- 环境变量：`TAVILY_API_KEY` 或 `SERPER_API_KEY`

## 测试与门禁

```bash
cd portfolio/agent-platform && .venv/bin/python -m unittest discover -s tests -v
cd portfolio/agent-eval-dashboard && PYTHONPATH=../agent-platform/src:src python3 -m unittest discover -s tests -v
python3 scripts/completion_gate.py --root .
```

## 仍属 P1（未阻塞演示）

1. 官方 LangGraph 替换自研状态机
2. Cross-encoder Rerank
3. ~~外网搜索 API（Tavily/Serper）~~ ✅ 已接入
4. Dev Agent 真实代码生成
5. 公网 HTTPS 部署（⏸ **暂缓，排求职最后阶段**；当前 GitHub + 本地 compose 即可投）

## 演示入口

```bash
cd work/ai-agent && docker compose up --build
open http://127.0.0.1:3000
```
