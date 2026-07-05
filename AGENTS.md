# AGENTS.md

## 项目使命

帮助一名 5 年 Java 背景的工程师，在 1～2 个月内完成 **Python AI Agent/RAG 应用工程师** 求职准备（杭州，**20K 起步**），并在 35 岁前成长为能独立设计、落地、评估 AI Agent 系统的工程师。

**当前阶段（2026-07-05 起 1 个月）：只学习 + 建设工程，不投简历。** 详见 [shuang-plan.md](shuang-plan.md)。

## 必读：总需求文档

**每次处理任务前，先读 [shuang-plan.md](shuang-plan.md)。** 其中包含：以终为始的目标、BOSS 搜索词、纯 Python 技能 P0、ProjectForge 项目叙事、Agent 执行规则与下一步优先级。

## 固定约束

- **求职叙事：纯 Python AI 应用**，不主打 Java 混合架构（Java 仅作学习加速器，仓库内 Java 代码可不删但不扩展）。
- 不移动、不重命名、不改写 `../../agent/` 课程资料。
- **Harness 工程**在 `../../harness-agent/`（与 `agent/` 同级），不在 `work/ai-agent/portfolio/` 下。
- 所有学习计划从 **杭州 Python AI Agent / RAG / 大模型应用** 岗位倒推。
- 不投纯算法研究岗；目标薪资杭州 **20K 左右**（18～25K 可谈）。
- 简历与 BOSS（⏸ 第 1 个月暂缓）：[logs/applications/resume-李爽-python-ai.md](logs/applications/resume-李爽-python-ai.md)、[docs/11-resume-and-interview-pack.md](docs/11-resume-and-interview-pack.md)。
- 所有新增资料放在本目录 `work/ai-agent/`，不污染父级课程目录。
- 不要主动 git commit，除非用户明确要求。

## 工作方式

1. 读 **[shuang-plan.md](shuang-plan.md)** → [README.md](README.md) → 任务相关文档。
2. 学习安排查 [docs/07-source-map.md](docs/07-source-map.md)。
3. 岗位判断查 [docs/08-job-market-hangzhou.md](docs/08-job-market-hangzhou.md)。
4. 作品集标准 [docs/06-portfolio-projects.md](docs/06-portfolio-projects.md)、[docs/19-project-completion-report.md](docs/19-project-completion-report.md)。
5. 新 feature **优先 Python** / `portfolio/agent-platform/`。
6. 更新 `logs/daily/` 复盘。

## 作品集核心（对外只讲一个项目）

**ProjectForge 企业级 AI Agent 平台（Python）** — 九阶段编排 + 企业知识库 RAG + 查证型知识库 + DeepResearch + eval + Docker。

## Agent 可调用的本地资料

**课程库在 `../../agent/`（25 个 part，只读）。不要试图学完；求职阶段按 [shuang-plan.md](shuang-plan.md) §「agent 资料库怎么用」精读 8 个 part 即可。**

| 必查 | 路径 |
|---|---|
| RAG | `../../agent/part05-agent-rag` |
| FastAPI | `../../agent/part10-agent` |
| 评估 | `../../agent/part13-agent-score` |
| 文档审核 | `../../agent/part22-agent-workspace/【加餐】案例11*`、`案例12*` |
| DeepResearch | `../../agent/part22-agent-workspace` 案例4 |
| LangGraph | `../../agent/part04-agent-langchain` |
| 多 Agent | `../../agent/part14-agent-help` |

完整映射 [docs/07-source-map.md](docs/07-source-map.md)。

## 质量门槛

算进度的只有：能 demo、能写进简历、能面试 2 分钟讲清、有 eval/测试数据。

<!-- shuang-skill:start -->
## Shuang Skill Workflow

This project has local Shuang Vibe Coding skills installed for Codex.

- Codex skills: `.codex/skills/`
- Claude skills: `.claude/skills/`
- Workflow map: `docs/vibe-coding-operating-map.md`
- Evolution inbox: `docs/skill-evolution/inbox/`
- Course-source ingestion guide: `docs/skill-evolution/course-source-ingestion.md`

Default behavior:

1. Use `shuang-flow` to identify the current phase before large changes.
2. Use `shuang-prompt` when a copyable handoff prompt is needed.
3. Before implementation, run `node scripts/spec-kit-handoff-check.mjs --feature <feature-dir>` when spec/plan/tasks exist.
4. Use `shuang-tdd` for feature implementation after the handoff package is ready.
5. For API/front-end handoff packages, run `node scripts/api-handoff-artifact-check.mjs --doc <handoff.md> --openapi <openapi.json>` before delivery.
6. For short one-line requests, use `docs/shuang-skill/short-command-routes.md`; after route edits, run `node scripts/short-command-route-check.mjs` and `node scripts/short-command-route-smoke.mjs`.
7. Before asking another AI to work in this project, run `node scripts/shuang-skill-manager.mjs context --json` to generate a source-backed project context pack.
8. For short one-line feature requests, prefer `node scripts/shuang-skill-manager.mjs start --request "<一句话需求>"`; use `node scripts/vibe-request-start.mjs --request "<一句话需求>"` only after the project is already installed. For edited request cards, run `node scripts/shuang-skill-manager.mjs request check`, `node scripts/shuang-skill-manager.mjs request status`, and `node scripts/shuang-skill-manager.mjs request prompt --raw` before handing the queue to another agent. To prove short-command routing still works, run `node scripts/shuang-skill-manager.mjs route-smoke`.
9. During daily work after an intake card exists, run `node scripts/shuang-skill-manager.mjs next --json` to check the queue, run guard, and get the next copyable prompt in one report.
10. For a beginner end-to-end rehearsal, run `node scripts/shuang-skill-manager.mjs drill --request "<一句话需求>" --json`; it chains install/readiness/start/request prompt/context/system-audit in one report.
11. Before push or before enabling a managed Git hook, run `node scripts/shuang-skill-manager.mjs guard --json`; it is the same safe preflight command used by the managed `pre-push` hook.
12. When changing installed helper scripts or docs, run `node scripts/managed-artifacts-check.mjs` to prevent install/project-doctor/quickstart drift.
13. For a whole-system check, run `node scripts/shuang-skill-manager.mjs system-audit --json`; add `--with-skill-studio`, `--with-install-smoke`, or `--with-sync-smoke` when validating broader changes from the source repo.
14. Use `shuang-router` before claiming a feature is ready.
15. Use `shuang-evolve` after a task if the lesson should improve future workflows; for batch inbox review run `node scripts/evolution-review.mjs`; before promoting a ready note, run `node scripts/evolution-promotion-package.mjs --note <note>`.
16. When using private learning materials to improve skills, keep source paths in `.shuang-skill/course-sources.local.json`, run `node scripts/course-source-health.mjs`, and only commit distilled workflow rules.

Do not treat this block as full project guidance. Generate or refresh the project-specific rules with `shuang-claude-md` after reading this project's real README, package files, docs, and specs.
<!-- shuang-skill:end -->
