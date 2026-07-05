# Vibe Coding Skill 系统需求总账

本文件把本轮用户提出的明确诉求，映射到当前仓库里的真实产物、使用入口和验证命令。它用于回答三个问题：

1. 这个项目现在是否覆盖了从一句需求到上线复盘的完整 Vibe Coding workflow。
2. 新手或新项目应该从哪里开始。
3. 后续继续进化时，应该检查哪些证据，避免只凭感觉说“已经完成”。

## 当前结论

截至 2026-06-25，当前仓库已经形成一套以 `shuang-flow`、`shuang-prompt`、`shuang-evolve` 和 `shuang-skill-manager.mjs` 为核心的项目级 skill 系统：

- 主流程覆盖：需求分析、脑暴、调研、PRD、架构、设计、Spec-Kit、TDD 实施、测试闭环、接口联调、代码交接、发布检查、复盘进化、课程提炼、安装同步。
- 新手入口：`README.md`、`docs/getting-started-for-beginners.md`、`docs/new-project-quickstart.md`、`./start.sh`、Skill Studio。
- 短提示词入口：`node scripts/shuang-skill-manager.mjs start --request "<一句话需求>"` 和 `node scripts/shuang-skill-manager.mjs next --raw`。
- 自动进化入口：`shuang-evolve`、`docs/skill-evolution/inbox/*.md`、`evolution-review`、`evolution-promotion-package`。
- 安装与回流入口：`install`、`audit`、`sync-back`、`guard`、`hooks`。
- 私有课程资料入口：`.shuang-skill/course-sources.local.json`、`course-source-health`、`course-source-inventory`、`course-local-extract`、`course-extract-to-notes`。

## 逐条需求对照

| 用户诉求 | 当前落点 | 使用方式 | 验证命令 |
|---|---|---|---|
| 记录项目总体目标：通过 skills 持续进化，成为 Vibe Coding 高手 | `AGENTS.md`、`CLAUDE.md`、`README.md`、`docs/skill-evolution/auto-upgrade-system.md` | 进入仓库先读 README 和自动进化文档 | `node scripts/vibe-system-audit.mjs --json` |
| 覆盖从需求分析到技术方案、原型、PRD、代码、测试、联调、上线的全流程 | `docs/vibe-coding-operating-map.md`、`docs/vibe-coding-capability-matrix.md`、`.codex/skill-groups/` | 按阶段使用 `shuang-flow` 路由到对应 skill | `node scripts/vibe-workflow-coverage-check.mjs` |
| skill 太多，按功能归类并合并能合并的入口 | `.codex/skill-groups/`、`.codex/skill-archive/`、`docs/skill-consolidation-plan.md` | 日常只看 canonical skill，旧入口放 archive | `node scripts/validate-skills.mjs` |
| 说明文档和新项目使用路线 | `docs/getting-started-for-beginners.md`、`docs/new-project-quickstart.md` | 新手先读 beginners，新项目按 quickstart 安装 | `node scripts/project-readiness.mjs` |
| 多条路线，包括提示词优化路线 | `docs/new-project-quickstart.md`、`docs/short-command-routes.md`、`shuang-prompt` | 短命令用 `start --request`，交接给 AI 用 `request prompt --raw` | `node scripts/short-command-route-check.mjs` 和 `node scripts/short-command-route-smoke.mjs` |
| 发布到 GitHub | Git remote `https://github.com/SunnySLJ/shuang-skill.git`，当前分支 `feat/skill-studio-unification` | 本地修改验证后 commit，再 push 到当前分支 | `git status --short --branch`、`git log --oneline -5 --decorate` |
| 整合 Skill-Distiller 和 Skill-Evolver | `Skill-Distiller/` 作为统一 Skill Studio，旧 `Skill-Evolver/` 不再存在 | `./start.sh` 启动统一项目 | `node scripts/project-doctor.mjs`、`node scripts/skill-studio-route-smoke.mjs` |
| 删除旧 Skill-Evolver，避免影响 | `project-doctor` 会检查旧目录是否回归 | 不再从旧目录启动 | `node scripts/project-doctor.mjs` |
| 写启动脚本 | `start.sh` | `OPENROUTER_API_KEY="$CODEX_API_KEY" ./start.sh` | `bash -n start.sh` |
| 自动升级进化 skill 的原理和详细文档 | `docs/skill-evolution/auto-upgrade-system.md`、`docs/skill-evolution/README.md`、`shuang-evolve` | 任务结束后说“用 shuang-evolve 复盘这次任务” | `node scripts/evolution-inbox-status.mjs --limit 8`、`node scripts/evolution-review.mjs --json` |
| 新手如何开始了解项目 | `docs/getting-started-for-beginners.md` | 先读 README，再跑 `./start.sh`，再做 `drill` 演练 | `node scripts/shuang-skill-manager.mjs drill --request "<一句话需求>" --json` |
| `/library` 和 `/evolve/theater` 能否从页面按钮访问 | `Skill-Distiller/src/app/page.tsx`、`Skill-Distiller/src/components/nav.tsx`、route smoke | 打开 `http://localhost:3270/` 后从导航/首页入口进入 | `node scripts/skill-studio-route-smoke.mjs` |
| 使用 skill 时是否还要写很长提示词 | `docs/short-command-routes.md`、`vibe-request-start`、`request prompt`、`project-context-pack` | 优先一句话需求，脚本生成结构化提示词 | `node scripts/shuang-skill-manager.mjs start --request "<一句话需求>"`、`node scripts/shuang-skill-manager.mjs next --raw` |
| skill 如何一步步帮开发并优化提示词 | `docs/vibe-coding-operating-map.md`、`docs/short-command-routes.md`、`shuang-flow`、`shuang-prompt` | `shuang-flow` 判阶段，`shuang-prompt` 生成交接提示词 | `node scripts/short-command-route-smoke.mjs` |
| hooks 或插件是否能更好完成项目 | `docs/hooks-and-plugins-roadmap.md`、`shuang-skill-manager hooks`、`guard` | 先用 `guard`，稳定后显式安装 managed `pre-push` hook | `node scripts/shuang-skill-manager-hooks.test.mjs` |
| 把系统安装到需要开发的项目，来新需求时帮我优化提示词并推进流程 | `shuang-skill-manager install/start/next/context`、目标项目 managed block | 在目标项目跑 `start --request "<一句话需求>"` | `node scripts/project-audit.mjs --target <project> --with-readiness --with-request-smoke --with-route-smoke` |
| 写安装脚本，安装到 Codex 和 Claude，并支持升级回流 | `shuang-skill-manager install`、`.codex/skills/`、`.claude/skills/`、`sync-back` | 源仓库安装到目标项目；目标项目改好 skill 后 `sync-back --apply` | `node scripts/sync-back-smoke.mjs` |
| 解释全局安装和项目本地安装区别 | `docs/new-project-quickstart.md` | 默认项目本地安装；通用成熟 skill 才考虑全局 | `node scripts/project-readiness.mjs` |
| 安装到两个业务项目 | `/Users/mac/Desktop/one-person/kuai-yan-fa-xingyao-pay-dev`、`/Users/mac/Desktop/one-person/kuai-yan-fa` | 用源仓库 `audit` 定期检查，不回滚业务脏改 | `node scripts/shuang-skill-manager.mjs audit --target <project> --with-readiness --with-start-smoke --with-request-smoke --with-route-smoke` |
| 用本机学习资料完善 skills | `.shuang-skill/course-sources.local.json`、`docs/skill-evolution/course-source-ingestion.md` | 私有资料只进本地 registry，公开仓库只保存原创规则 | `node scripts/course-source-health.mjs`、`node scripts/course-source-inventory.mjs --json` |

## 新项目最短路线

在 `shuang-skill` 源仓库里：

```bash
node scripts/shuang-skill-manager.mjs install --target /path/to/new-project
node scripts/shuang-skill-manager.mjs start --target /path/to/new-project --request "帮我加一个新功能，按我的 Vibe Coding 流程走。"
```

在已经安装好的目标项目里：

```bash
node scripts/shuang-skill-manager.mjs start --request "帮我加一个新功能，按我的 Vibe Coding 流程走。"
node scripts/shuang-skill-manager.mjs next --raw
```

这条路线会把一句话需求变成入口卡、阶段判断、推荐 skill、停止点、验证命令和下一轮可复制提示词。通常不需要用户手写很长背景；目标项目安装了 `project-context-pack.mjs` 时，会自动注入安全项目上下文摘要。

## 维护者继续进化路线

1. 每次真实任务结束后，用 `shuang-evolve` 写 evolution note。
2. 先跑 `evolution-review`，只处理 `ready` 或证据缺口明确的候选。
3. 课程资料先跑 health/inventory/extract，只把原创规则升级进 skill。
4. 改 skill、短命令路线、安装脚本或 Skill Studio 后，按影响范围跑对应验证。
5. 改本需求总账后，先运行 `node scripts/vibe-requirement-audit-check.mjs`，再运行 `node scripts/vibe-system-audit.mjs --json`。
6. 安装到业务项目后，用 `audit` 验证目标项目，不回滚业务项目已有脏改。
7. 提交前跑 `guard` 或 `project-doctor`，需要时再启用 managed `pre-push` hook。

## 当前边界

- Skill Studio 的 `Project Launch Pad` 和 `Context Handoff` 生成命令/提示词，不直接执行本机写文件操作。
- `shuang-evolve` 不会无条件覆盖 `SKILL.md`；必须先有 note、长期化判断和验证证据。
- 课程资料、PDF、截图、源码包、私有摘要都保存在 `.shuang-skill/` 或原始本机路径，不提交到 GitHub。
- managed Git hook 不会默认启用；必须显式运行 `hooks install`。
- GitHub Actions、正式 Codex plugin 和 Spec-Kit extension hooks 仍属于路线图，不应写成当前已启用能力。
