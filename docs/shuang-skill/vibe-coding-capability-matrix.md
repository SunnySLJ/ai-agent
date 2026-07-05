# Vibe Coding 能力覆盖矩阵

这份矩阵是 `shuang-skill` 的能力总账，用来回答一个问题：从一句需求到上线复盘，当前系统是否有明确入口 skill、关键产物、验证命令和安装范围。

它不替代 `docs/vibe-coding-operating-map.md`。Operating Map 说明“怎么走流程”，本矩阵说明“哪些能力必须被覆盖、怎么检查是否还在”。

## 覆盖范围

| 能力ID | 目标 | 入口 skill | 关键产物 | 验证命令 | 安装范围 |
|---|---|---|---|---|---|
| intake | 接收一句话需求，判断当前阶段、风险边界和下一步 | `shuang-flow` | `docs/vibe-requests/*.md`、阶段判断、下一触发、停止点、可复制提示词 | `node scripts/project-readiness.mjs` / `node scripts/short-command-route-check.mjs` / `node scripts/short-command-route-smoke.mjs` / `node scripts/shuang-skill-manager.mjs drill --request "<一句话需求>" --json` / `node scripts/shuang-skill-manager.mjs start --request "<一句话需求>"` / `node scripts/shuang-skill-manager.mjs next --json` / `node scripts/shuang-skill-manager.mjs request check` / `node scripts/shuang-skill-manager.mjs request status` / `node scripts/shuang-skill-manager.mjs request prompt --raw` / `node scripts/project-start.mjs --request "<一句话需求>"` / `node scripts/vibe-request-start.mjs --request "<一句话需求>"` / `node scripts/vibe-request-check.mjs` / `node scripts/vibe-request-status.mjs` / `node scripts/vibe-request-prompt.mjs` | source+target |
| brainstorm | 把模糊想法收敛为目标、非目标、MVP 和验收标准 | `shuang-brainstorm` | 脑暴结论、验收草案 | `node scripts/project-doctor.mjs` | source+target |
| research | 对竞品、资料、方案或可行性做证据驱动调研 | `shuang-research` | `specs/research/*`、决策汇总 | `node scripts/project-doctor.mjs` | source+target |
| prd | 把调研和脑暴结果写成结构化 PRD | `shuang-prd` | `specs/prd.md` | `node scripts/project-doctor.mjs` | source+target |
| arch | 比较技术方案、源码方案、fork/复用/自建路线 | `shuang-arch` | 架构基线决策 | `node scripts/project-doctor.mjs` | source+target |
| design | 把 PRD、截图、Figma 或参考站转成 UI/设计约束 | `shuang-design` | `DESIGN.md`、页面规范、design tokens | `node scripts/project-doctor.mjs` | source+target |
| specs | 把 PRD 拆成 Spec-Kit feature 文档 | `shuang-specs` | `spec.md`、`plan.md`、`tasks.md` | `node scripts/spec-kit-handoff-check.mjs --feature <feature-dir>` | source+target |
| implement | 按 feature 文档和 tasks 做 TDD 实施 | `shuang-tdd` | 测试、代码、状态记录 | `node scripts/spec-kit-handoff-check.mjs --feature <feature-dir>` | source+target |
| test | 在 feature 收尾时判断后端、前端、接缝或完整链路测试缺口 | `shuang-router` | 测试路由结论、补测证据、发布门 | `node scripts/project-doctor.mjs` | source+target |
| api-handoff | 把后端接口整理成前端可联调的文档和 OpenAPI | `shuang-api-handoff` | 接口清单、代码顺序、Mermaid、OpenAPI JSON | `node scripts/api-handoff-artifact-check.mjs --doc <handoff.md> --openapi <openapi.json>` | source+target |
| code-handoff | 把一次实现或修复整理成可跳转代码链路 | `shuang-code-handoff` | 方法行号、调用顺序、数据流、验证证据 | `node scripts/project-doctor.mjs` | source+target |
| prompt | 生成可复制给 Codex、Claude Code、Cursor 或下一会话的提示词 | `shuang-prompt` | 项目上下文包、短命令意图卡、交接提示词 | `node scripts/project-doctor.mjs` / `node scripts/shuang-skill-manager.mjs context --json` | source+target |
| release-readiness | 发布前确认验证证据、风险缺口、交接材料和下一步 | `shuang-router` / `shuang-prompt` | 发布判断、剩余风险、下一轮提示词 | `node scripts/project-doctor.mjs` / `node scripts/shuang-skill-manager.mjs guard --json` | source+target |
| evolve | 把任务经验、失败点、课程提炼升级为 inbox note 或 skill diff | `shuang-evolve` | `docs/skill-evolution/inbox/*.md`、最小 skill diff | `node scripts/evolution-inbox-status.mjs --limit 8` / `node scripts/evolution-review.mjs --json` | source+target |
| install-sync | 把本仓库 skill 系统安装到目标项目，并把目标项目升级同步回来 | `shuang-evolve` | `.shuang-skill/config.json`、安装产物、audit 结果、sync-back 结果 | `node scripts/project-audit.mjs --target <project> --with-readiness --with-request-smoke --with-route-smoke` / `node scripts/sync-back-smoke.mjs` | source+target |
| course | 把本机课程、Excalidraw、Notebook、源码案例安全提炼为原创规则 | `shuang-evolve` | local registry、inventory、course evolution note | `node scripts/course-source-health.mjs` / `node scripts/course-source-inventory.mjs --json` | source+target |

## 使用方式

- 新增或删除主流程 skill 时，先改本矩阵，再改 `docs/vibe-coding-operating-map.md` 和对应 quickstart。
- 新手第一次接入时，可先运行 `node scripts/shuang-skill-manager.mjs drill --request "<一句话需求>" --json` 做完整演练；真实新需求进入项目时，优先运行 `node scripts/shuang-skill-manager.mjs start --request "<一句话需求>"`；在源仓库里操作目标项目时加 `--target /path/to/project`。它会安装/更新、运行 `project-doctor`、生成 `docs/vibe-requests/*.md` 入口卡、校验结构、汇总阶段并打印可复制提示词；入口卡已存在或人工修改后，日常优先运行 `node scripts/shuang-skill-manager.mjs next --json`，它会聚合 `request check/status/prompt` 和 `guard` 并输出下一轮提示词。需要调试底层脚本时再运行 `node scripts/create-feature-intake.mjs`、`node scripts/vibe-request-check.mjs`、`node scripts/vibe-request-status.mjs`、`node scripts/vibe-request-prompt.mjs`。
- 提交前或启用 managed Git hook 前，先手动跑 `node scripts/shuang-skill-manager.mjs guard --json`。它和 managed `pre-push` hook 共用同一条安全预检路径，当前默认只执行确定性的 `project-doctor`，不自动改业务代码、不自动回流 skill。
- 新增安装产物时，更新 `scripts/shuang-skill-manager.mjs`、`scripts/project-doctor.mjs`，并运行 `node scripts/managed-artifacts-check.mjs`；安装到多个业务项目后，用 `node scripts/project-audit.mjs --target <project> --with-readiness --with-request-smoke --with-route-smoke` 做项目级审计。
- 新增短命令入口时，更新 `docs/short-command-routes.md`，并运行 `node scripts/short-command-route-check.mjs` 和 `node scripts/short-command-route-smoke.mjs`。
- 新增课程资料提炼规则时，先保证 `.shuang-skill/` 本地私有边界通过 `node scripts/course-source-health.mjs`。

## 安装范围说明

| 范围 | 含义 |
|---|---|
| source+target | 源仓库和安装后的业务项目都应该能看到相关文档或脚本 |
| source-only | 只在 `shuang-skill` 源仓库运行，用来验证安装、回流或发布级能力 |

`install-sync` 同时使用 `source+target`：`project-audit.mjs` 会复制到目标项目用于本地审计，`sync-back-smoke.mjs` 仍主要在源仓库验证回流闭环。
