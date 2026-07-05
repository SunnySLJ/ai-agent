# 新项目使用 shuang-skill 指南

这份文档回答两个问题：

1. 新项目如何接入这套 skills。
2. 接入后，从想法到上线每个阶段应该怎么用。

如果你是第一次进入本仓库，还不清楚 `Skill-Distiller`、`.codex/skills/` 和 `shuang-flow` 分别是什么，先读 `docs/getting-started-for-beginners.md`。

## 先理解一件事

`.codex/skills/` 是运行时发现目录。当前仓库里的 skills 只会在当前工作区稳定出现；如果你打开的是一个全新的项目，通常需要把活跃 skills 安装到新项目的 `.codex/skills/`，或者把成熟通用 skill 安装到全局 `~/.codex/skills/`。

推荐优先使用“项目本地安装”：每个项目有自己的 `.codex/skills/`、`AGENTS.md`、`docs/`，不会互相污染。

## 接入方式

### 方式 A：安装脚本（推荐）

在 `shuang-skill` 仓库根目录运行：

```bash
node scripts/shuang-skill-manager.mjs install --target /path/to/new-project
```

它会把当前仓库的核心 workflow 安装到目标项目：

- `.codex/skills/`：Codex 项目级 skills。
- `.codex/skill-groups/`：skill 分组索引。
- `.claude/skills/`：Claude 项目级 skills。
- `AGENTS.md` / `CLAUDE.md`：追加一个 `shuang-skill` managed block；不会删除你原来的项目说明。
- `docs/vibe-coding-operating-map.md`：Vibe Coding 阶段地图。
- `docs/shuang-skill/vibe-coding-capability-matrix.md`：端到端能力覆盖矩阵，说明每个阶段的入口 skill、关键产物、验证命令和安装范围。
- `docs/shuang-skill/vibe-system-requirement-audit.md`：原始目标到当前产物、使用入口和验证命令的需求总账。
- `docs/shuang-skill/short-command-routes.md`：一句话短提示词到阶段、skill、下一触发和停止点的路线表。
- `docs/skill-evolution/`：复盘进化目录。
- 目标项目可用的辅助脚本：
  `scripts/create-feature-intake.mjs`、`scripts/project-audit.mjs`、`scripts/project-readiness.mjs`、`scripts/project-context-pack.mjs`、`scripts/project-start.mjs`、`scripts/beginner-drill.mjs`、`scripts/short-command-route-smoke.mjs`、`scripts/vibe-request-start.mjs`、`scripts/vibe-request-check.mjs`、`scripts/vibe-request-prompt.mjs`、`scripts/vibe-request-status.mjs`、`scripts/create-evolution-note.mjs`、`scripts/create-course-evolution-note.mjs`、`scripts/evolution-inbox-status.mjs`、`scripts/evolution-review.mjs`、`scripts/evolution-promotion-package.mjs`、`scripts/short-command-route-check.mjs`、`scripts/vibe-workflow-coverage-check.mjs`、`scripts/vibe-system-audit.mjs`、`scripts/vibe-requirement-audit-check.mjs`、`scripts/api-handoff-artifact-check.mjs`、`scripts/managed-artifacts-check.mjs`、`scripts/spec-kit-handoff-check.mjs`、`scripts/course-source-health.mjs`、`scripts/course-source-inventory.mjs`、`scripts/course-local-extract.mjs`、`scripts/course-extract-to-notes.mjs`、`scripts/agent-workbench-boundary-check.mjs`、`scripts/memory-placement-check.mjs`、`scripts/validate-skills.mjs`、`scripts/project-doctor.mjs`、`scripts/shuang-skill-manager.mjs`。
- `.shuang-skill/config.json`：记录源仓库路径，用于未来把升级后的 skill 同步回来。

如果目标项目已经存在 `.codex/skills/`、`.codex/skill-groups/` 或 `.claude/skills/`，安装脚本会先备份到 `.shuang-skill/backups/`，再写入当前源仓库版本。

如果你只想预览将要做什么：

```bash
node scripts/shuang-skill-manager.mjs install --target /path/to/new-project --dry-run
```

维护本仓库时，可以先用临时目录跑一次真实安装烟测：

```bash
node scripts/fresh-install-smoke.mjs
```

这条 smoke 会在临时空项目里完成安装，然后验证目标项目 `project-doctor`、readiness、入口卡 `request prompt`、`next` 和短命令动态路由，确保新项目不是只复制了文件，而是真的能用一句需求进入下一轮提示词。

如果你是新手，想先跑一遍“从安装到拿到下一轮提示词”的完整演练，用：

```bash
node scripts/shuang-skill-manager.mjs drill \
  --target /path/to/new-project \
  --request "我是新手，帮我加一个登录页，按 Vibe Coding 流程走。" \
  --json
```

`drill` 会串联安装/更新、readiness、`start --request`、`request prompt --raw`、`context --json` 和 `system-audit --json`，最后给出结构化报告和可复制提示词。没有真实目标项目时，可以在源仓库直接跑 `node scripts/shuang-skill-manager.mjs drill --keep --json`，脚本会创建一个临时 playground 并保留下来供你查看。

如果你想额外生成 pre-push hook 模板：

```bash
node scripts/shuang-skill-manager.mjs install --target /path/to/new-project --with-hooks
```

模板会放在 `.shuang-skill/hooks/pre-push`。如果安装时没加 `--with-hooks`，后续也可以在目标项目里单独补模板：

```bash
node scripts/shuang-skill-manager.mjs hooks template
```

启用真实 Git hook 前，先手动跑一次和 hook 共用的安全预检：

```bash
node scripts/shuang-skill-manager.mjs guard --json
```

`guard` 当前只调用目标项目的 `project-doctor`，不写 `.git/hooks`，不修改业务代码，也不自动把本地 skill 改动同步回源仓库。确认稳定后，不需要手动复制，直接在目标项目里显式激活：

```bash
node scripts/shuang-skill-manager.mjs hooks status
node scripts/shuang-skill-manager.mjs hooks install
```

如果已有自己的 `.git/hooks/pre-push`，脚本默认拒绝覆盖；确认要替换时才加 `--force`，原 hook 会先备份到 `.shuang-skill/backups/`。移除 managed hook：

```bash
node scripts/shuang-skill-manager.mjs hooks remove
```

安装后进入目标项目，先查看状态：

```bash
node scripts/project-readiness.mjs
node scripts/shuang-skill-manager.mjs status
node scripts/shuang-skill-manager.mjs guard --json
node scripts/shuang-skill-manager.mjs system-audit --json
node scripts/project-doctor.mjs
```

`project-readiness.mjs` 会把 `project-doctor`、`validate-skills` 和短提示词动态路由烟测集中成一个新手可读报告，并给出 `drill` 演练命令和下一条 `start --request` 命令。`guard --json` 是提交前轻量预检，和 managed hook 共用入口。`system-audit --json` 用来做更完整的系统能力审计：skill 结构、能力矩阵、managed artifacts、readiness 和 evolution inbox 是否同时健康。

生成给 Codex、Claude Code、Cursor 或 Skill Studio 使用的项目上下文包：

```bash
node scripts/shuang-skill-manager.mjs context --json
node scripts/shuang-skill-manager.mjs context --format markdown
```

它只读取 README、AGENTS/CLAUDE、package/build manifest 和 `specs/**/*.md` 等安全入口文件，不读取 `.env*`、源码树、依赖目录或构建缓存。默认 JSON 可以作为 `shuang-prompt` 或 Skill Studio 的输入，Markdown 适合人工快速查看。

日常一句话需求不需要手动先跑这条命令：`start --request` 和 `request prompt --raw` 会在目标项目存在 `scripts/project-context-pack.mjs` 时自动生成上下文包摘要，并把项目名、技术信号、建议阅读顺序和入口文件数量拼进下一轮可复制提示词。

如果你想把某次真实项目经验交给 Skill Studio 复盘，打开 `/evolve/theater` 的 `Context Handoff` 面板，把 `context --json` 结果、任务信号和 review/test evidence 粘进去。页面会生成一段可复制的 `shuang-evolve` 交接提示词；真正写入 inbox note、修改 skill 和标记 `promoted` 仍然要走命令行验证。

如果你要从源仓库一次性确认多个已安装项目是否仍然健康，用审计入口：

```bash
node scripts/shuang-skill-manager.mjs audit \
  --target /path/to/project-a \
  --target /path/to/project-b \
  --with-readiness \
  --with-start-smoke \
  --with-request-smoke \
  --with-route-smoke
```

它会检查 managed 文件、目标项目 `project-doctor`、`validate-skills`、hook 状态、可选的新手 readiness、可选的 `project-start` 烟测、可选的入口卡队列 `request prompt` 烟测和可选的短命令路由烟测。未显式激活 managed hook 是 warning，不会阻断。

审计的 `--json` 默认是紧凑输出：成功命令只保留 `exitCode`、`stage`、`skill`、`total/passed/failed` 等结构化字段，避免多个项目一起审计时输出被截断。需要原始 stdout/stderr 日志时再加：

```bash
node scripts/shuang-skill-manager.mjs audit --target /path/to/project --with-readiness --with-request-smoke --with-route-smoke --json --include-output
```

如果你还在 `shuang-skill` 源仓库里，手上已经有目标项目和一句新需求，最短路线是：

```bash
node scripts/shuang-skill-manager.mjs start \
  --target /path/to/new-project \
  --title "批量重试" \
  --request "帮我给视频生成任务加一个批量重试功能，按我的 Vibe Coding 流程走。"
```

它会自动完成安装/更新、目标项目 `project-doctor`、入口卡生成、结构校验、阶段汇总和可复制提示词提取。

如果你不确定这套路线会做什么，先跑一遍新手演练：

```bash
node scripts/shuang-skill-manager.mjs drill \
  --target /path/to/new-project \
  --request "先帮我演练一个设置页需求。"
```

演练通过后，日常真实需求再用 `start --request`。

如果你已经打开 Skill Studio，也可以在 Workbench 首页的 `Project Launch Pad` 填目标项目路径和一句话需求，复制同样的 `install`、`readiness`、`guard`、`drill`、`system-audit`、`start --request`、`next`、`context --json`、`sync-back` 命令。页面只负责生成命令，不会执行本机安装、预检或回流。

如果你已经在安装好的目标项目根目录里，项目来了一个新需求，但你还不想写长提示词，优先用一键入口：

```bash
node scripts/shuang-skill-manager.mjs start \
  --title "批量重试" \
  --request "帮我给视频生成任务加一个批量重试功能，按我的 Vibe Coding 流程走。"
```

它会使用 `.shuang-skill/config.json` 里的源仓库路径先更新 managed skills 和脚本，再写入 `docs/vibe-requests/YYYY-MM-DD-<title>.md`，并输出里的 `Prompt` 可以直接交给 Codex、Claude Code、Cursor 或另一个会话继续执行。这个 `Prompt` 会自动带上安全项目上下文摘要，让目标 AI 先按真实 `AGENTS.md`、README、manifest 和 specs 的建议顺序取证。

如果你只想在已安装项目里生成入口卡，不想重新安装/更新 skills，也可以直接调用底层入口：

```bash
node scripts/vibe-request-start.mjs \
  --title "批量重试" \
  --request "帮我给视频生成任务加一个批量重试功能，按我的 Vibe Coding 流程走。"
```

`vibe-request-start` 会写入同样的入口卡，并依次完成入口卡生成、结构校验、阶段汇总和可复制提示词提取。

如果你要拆开调试每一步，可以先生成一个需求入口卡：

```bash
node scripts/create-feature-intake.mjs \
  --title "批量重试" \
  --request "帮我给视频生成任务加一个批量重试功能，按我的 Vibe Coding 流程走。"
```

底层脚本会写入同样的入口卡，里面包含短命令意图卡、推荐入口 skill、停止点、可复制提示词和验证命令。然后把这个文件交给 Codex 或 Claude 继续执行即可。

入口卡生成或手动修改后，日常先跑：

```bash
node scripts/shuang-skill-manager.mjs next --json
node scripts/shuang-skill-manager.mjs next --raw
```

`next --json` 会聚合入口卡结构检查、队列状态、下一轮提示词和 `guard` 预检；`next --raw` 只输出可复制给 Agent 的下一轮提示词。需要拆开排查时再跑：

```bash
node scripts/shuang-skill-manager.mjs request check
node scripts/shuang-skill-manager.mjs request status
node scripts/shuang-skill-manager.mjs request prompt --raw
```

`request check` 用来阻断缺字段的卡片；`request status` 用来查看当前 `docs/vibe-requests/*.md` 队列分别处在哪个阶段、推荐哪个 skill、下一触发和停止点是什么；`request prompt --raw` 会从最新入口卡抽出下一轮可复制提示词，并在可用时自动注入项目上下文包摘要。底层 `vibe-request-check/status/prompt` 脚本仍然可用，主要用于排查 manager wrapper 之外的低层问题。

如果你主要想用一句话短命令推进项目，先看：

```text
docs/shuang-skill/vibe-coding-capability-matrix.md
docs/shuang-skill/short-command-routes.md
```

维护或修改短命令路线后运行：

```bash
node scripts/short-command-route-check.mjs
node scripts/short-command-route-smoke.mjs
```

`short-command-route-check` 校验路线表、能力矩阵和脚本映射是否一致；`short-command-route-smoke` 会把 16 条典型短提示词实际跑过 `vibe-request-start`，确认 stage/skill 路由没有漂移。只想抽查某几个阶段时：

```bash
node scripts/shuang-skill-manager.mjs route-smoke --case api-handoff --case prompt
```

然后对 Codex 或 Claude 说：

```text
请使用 shuang-claude-md，读取当前项目真实 README/package/specs/docs，生成适合本项目的 AGENTS.md 和 CLAUDE.md。不要照搬 shuang-skill 仓库的项目目标，只保留 Vibe Coding 工作流和本项目真实命令。
```

### 把目标项目里升级后的 skill 同步回本仓库

目标项目里如果通过 `shuang-evolve` 改好了某个 skill，先预览：

```bash
node scripts/shuang-skill-manager.mjs sync-back
```

确认后再应用：

```bash
node scripts/shuang-skill-manager.mjs sync-back --apply
```

如果是在 `shuang-skill` 源仓库里主动拉取某个目标项目的更新：

```bash
node scripts/shuang-skill-manager.mjs sync-back --target /path/to/new-project
node scripts/shuang-skill-manager.mjs sync-back --target /path/to/new-project --apply
```

默认只同步源仓库已有的 skill 和 `docs/skill-evolution/inbox/*.md`。如果目标项目新增了全新的 skill，需要显式确认：

```bash
node scripts/shuang-skill-manager.mjs sync-back --apply --include-new
```

同步后脚本会自动在源仓库运行：

```bash
node scripts/validate-skills.mjs
```

维护 `shuang-skill` 源仓库时，可以用临时源和临时目标跑一次回流烟测，确认不会污染真实源仓库：

```bash
node scripts/sync-back-smoke.mjs
```

### 方式 B：手动本地安装

把当前仓库作为 skill 源，把活跃 skills 和分组索引复制到目标项目：

```bash
SOURCE=/Users/mac/Desktop/shuang-kuai/shuang-skill
TARGET=/path/to/new-project

mkdir -p "$TARGET/.codex" "$TARGET/docs/shuang-skill" "$TARGET/docs/skill-evolution/inbox"
rsync -a "$SOURCE/.codex/skills/" "$TARGET/.codex/skills/"
rsync -a "$SOURCE/.codex/skill-groups/" "$TARGET/.codex/skill-groups/"
cp "$SOURCE/docs/vibe-coding-operating-map.md" "$TARGET/docs/vibe-coding-operating-map.md"
cp "$SOURCE/docs/vibe-coding-capability-matrix.md" "$TARGET/docs/shuang-skill/vibe-coding-capability-matrix.md"
cp "$SOURCE/docs/vibe-system-requirement-audit.md" "$TARGET/docs/shuang-skill/vibe-system-requirement-audit.md"
cp "$SOURCE/docs/short-command-routes.md" "$TARGET/docs/shuang-skill/short-command-routes.md"
cp "$SOURCE/docs/skill-evolution/README.md" "$TARGET/docs/skill-evolution/README.md"
```

不要直接复制当前仓库的 `AGENTS.md` 到新项目。新项目的 `AGENTS.md` 应该从新项目真实 README、package、PRD、架构文档和命令里生成。

生成新项目指导文件时，在新项目根目录对 Codex 说：

```text
请使用 shuang-claude-md，读取当前项目真实 README/package/specs/docs，生成适合本项目的 AGENTS.md 和 CLAUDE.md。不要照搬 shuang-skill 仓库的项目目标，只保留 Vibe Coding 工作流和本项目真实命令。
```

### 方式 C：全局安装

如果你希望任何项目都能直接触发这套 workflow，可以把稳定通用的 skills 复制到全局：

```bash
SOURCE=/Users/mac/Desktop/shuang-kuai/shuang-skill
mkdir -p ~/.codex/skills
rsync -a "$SOURCE/.codex/skills/" ~/.codex/skills/
```

全局安装更方便，但不建议把强项目语境的 skill 长期全局化。新项目正式开始前，仍然要生成项目自己的 `AGENTS.md`。

## 多条使用路线

不同项目不需要硬套同一条路。先按目标选择路线，再调用对应 skill。

| 路线 | 适合场景 | skill 顺序 | 主要产物 |
|---|---|---|---|
| 0. 项目接入路线 | 已有或新建项目第一次接入这套 workflow | 安装 skills -> `shuang-claude-md` -> `shuang-flow` | `.codex/skills/`、`AGENTS.md`、`CLAUDE.md` |
| 1. 快速 MVP 路线 | 想快速验证一个小产品或小工具 | `shuang-brainstorm` -> `shuang-prd` -> `shuang-specs` -> handoff check -> `shuang-tdd` -> `shuang-router` -> 复盘 | MVP PRD、1 个 feature、代码、测试缺口报告 |
| 2. 标准产品路线 | 从 0 到 1 做完整产品 | `shuang-brainstorm` -> `shuang-research` -> `shuang-prd` -> `shuang-arch` -> `shuang-design` -> `shuang-specs` -> handoff check -> `shuang-tdd` -> `shuang-router` -> `shuang-prompt` -> 复盘 | 调研、PRD、架构基线、DESIGN、feature 文档、实现、测试、交接 |
| 3. 前端原型路线 | 已有截图、Figma、HTML、参考站，目标是做出页面 | `shuang-web-design-master` / `figma-to-nextjs-migration` / `shuang-prototype-to-next` -> `shuang-next` -> `shuang-frontend` | 页面施工 spec、Next.js 页面、视觉/交互验证 |
| 4. 后端/API 路线 | 主要做接口、AI API、前后端联调 | `shuang-prd` -> `shuang-specs` -> `shuang-tdd` -> `shuang-ai-api-builder` -> `shuang-api-handoff` -> `shuang-slice` | API spec、实现、schema/env/route、接口文档、联调验证 |
| 5. 提示词优化路线 | 你已有一段粗糙提示词，想让另一个 AI 更稳定执行 | `enhance-prompt` -> `shuang-prompt` -> 目标 AI 执行 -> 复盘 | 可复制提示词、执行约束、验证要求、下一轮优化点 |
| 6. 现有项目改造路线 | 已有代码库，想加功能、重构或修问题 | `shuang-flow` -> 读真实项目 -> `shuang-prd`/`shuang-specs` 或直接 `shuang-tdd` -> `shuang-router` | 项目化需求、最小改动、验证证据 |
| 7. Skill 进化路线 | 一轮任务结束，想把经验沉淀成可复用 workflow | `shuang-evolve` -> evolution note -> Skill Studio `/evolve/theater` Context Handoff -> 修改候选 -> `scripts/validate-skills.mjs` | inbox note、可复制交接提示词、skill diff、结构校验结果 |
| 8. 学习资料提炼路线 | 有课程、流程图、源码案例，想持续完善 skills | 本地 registry -> `course-source-health` -> `course-source-inventory` -> `shuang-evolve` -> 最小 skill diff -> 校验 | 私有资料索引、inventory、evolution note、原创规则 |
| 9. 代码链路交付路线 | 需求、bugfix 或页面做完后，想知道所有关键代码和方法在哪 | `shuang-code-handoff`；接口联调再追加 `shuang-api-handoff` | 可跳转代码链路文档、方法行号、流程图、验证记录 |

### 路线 1：快速 MVP

```text
shuang-brainstorm -> shuang-prd -> shuang-specs -> handoff check -> shuang-tdd -> shuang-router -> 复盘
```

只做一个 Must-have feature。适合先验证方向，不适合一次性上复杂权限、支付、增长系统。

### 路线 2：标准产品

```text
想法
-> shuang-brainstorm
-> shuang-research
-> shuang-prd
-> shuang-arch
-> shuang-design / shuang-web-design-master
-> shuang-specs + speckit-*
-> node scripts/spec-kit-handoff-check.mjs --feature specs/00X-feature-name
-> shuang-tdd
-> shuang-router + 测试 executor
-> shuang-prompt
-> shuang-evolve / Skill Studio / evolution note
```

适合你想完整训练“需求 -> 技术方案 -> 设计 -> 文档 -> 代码 -> 测试 -> 联调 -> 上线 -> 复盘”的 Vibe Coding 能力。

### 路线 3：前端原型

```text
截图/Figma/HTML/参考站
-> shuang-web-design-master / figma-to-nextjs-migration / shuang-prototype-to-next
-> shuang-next
-> shuang-frontend
```

适合“照这个页面做”“把这个原型迁到 Next.js”“先做出可看的 UI”。如果页面会连真实接口，再追加 `shuang-slice` 做接缝验证。

### 路线 4：后端/API

```text
接口需求
-> shuang-prd / shuang-specs
-> shuang-tdd
-> shuang-ai-api-builder
-> shuang-api-handoff
-> shuang-slice
```

适合后端接口、AI API、流式 route、Zod schema、env 校验、Apifox/前端联调交付。

### 路线 5：提示词优化

```text
一句话需求/粗糙提示词/混乱上下文
-> shuang-flow 判断阶段
-> shuang-prompt 生成短命令意图卡
-> enhance-prompt（需要打磨表达时）
-> shuang-prompt
-> 目标 AI 执行
-> 复盘效果
```

短命令不需要你一次性写清每个点。`shuang-prompt` 会先保留原话并生成意图卡：推断阶段、目标 AI、必读文件、硬约束、阻塞缺口和停止点。只有阻塞产品方向、架构、安全、外部依赖或验收的问题才会追问。

`enhance-prompt` 用来优化提示词本身：角色、上下文、目标、输入、约束、方法、输出格式、停止规则、验证证据。`shuang-prompt` 用来读取当前项目真实文件，生成项目阶段交接提示词。两者可以组合：先用 `shuang-prompt` 判断阶段和项目事实，需要打磨表达时再用 `enhance-prompt`，最后回到 `shuang-prompt` 补真实路径、文件、阶段和验证要求。

一句话短命令的标准路线表见 `docs/shuang-skill/short-command-routes.md`。如果目标项目里没有这个文件，重新从源仓库运行 `node scripts/shuang-skill-manager.mjs install --target <project>`。

### 路线 6：现有项目改造

```text
已有代码库
-> shuang-flow 判断阶段
-> 读 README/package/AGENTS/specs/关键代码
-> shuang-prd / shuang-specs / shuang-tdd
-> shuang-router
```

适合“在旧项目里加一个功能”“解释现有逻辑后再改”“修 bug”。原则是先读真实代码和文档，不把新项目流程硬套到旧项目。

### 路线 9：代码链路交付

```text
需求/bugfix/页面/接口/脚本已完成，或只想只读梳理
-> shuang-code-handoff
-> 如需接口联调/Apifox，再追加 shuang-api-handoff
```

适合“把这次 AI 开发过程写清楚”“我要知道所有代码在哪个方法”“生成可跳转代码文档”。产物默认放在 `docs/code-handoff/YYYYMMDD-<feature>.md`，必须包含文件、方法、真实行号、数据流、Mermaid 图和验证证据。

### 路线 7：Skill 进化

```text
任务完成/踩坑/用户纠正
-> docs/skill-evolution/inbox/YYYY-MM-DD-<topic>.md
-> node scripts/evolution-review.mjs
-> shuang-evolve + Skill Studio `/evolve/theater`
-> 修改目标 SKILL.md 或 references
-> node scripts/validate-skills.mjs
```

适合把反复出现的问题变成长期规则。`evolution-review` 会批量列出 promote candidates、draft fixes、close candidates 和 lifecycle evidence gaps；一次性业务事实不要直接写进 skill。

如果经验来自另一个项目，先在那个项目运行 `node scripts/shuang-skill-manager.mjs context --json`，再把输出连同 review/test evidence 粘到 Skill Studio `/evolve/theater` 的 `Context Handoff` 面板。这样 `shuang-evolve` 能拿到项目背景和证据，但仍然保持 inbox-first：证据不足只保留 note，不直接改长期 skill。

### 路线 8：学习资料提炼

```text
课程/流程图/源码案例
-> .shuang-skill/course-sources.local.json
-> node scripts/course-source-health.mjs
-> node scripts/course-source-inventory.mjs
-> node scripts/course-local-extract.mjs --sources "<source-id>"
-> node scripts/course-extract-to-notes.mjs
-> node scripts/create-course-evolution-note.mjs
-> shuang-evolve
-> node scripts/validate-skills.mjs
```

只提交提炼后的原创规则、流程、检查表和验证命令。不要提交课程原文、PDF 正文、截图、zip、模型文件或大段摘录。

## 常用启动提示词

### 1. 只有一个想法

```text
请使用 shuang-flow 判断当前阶段，然后用 shuang-brainstorm 帮我把这个想法收敛成 MVP。

项目想法：
<写你的想法>

要求：
- 先问关键问题，不要直接写代码。
- 输出目标用户、痛点、MVP、非目标、验收标准。
- 如果信息足够，给 2-3 个实现路径和推荐方案。
```

### 2. 已经想清楚，需要正式 PRD

```text
请使用 shuang-prd，把下面的产品想法/脑暴结论整理成 specs/prd.md。

要求：
- 中文为主，关键技术名词保留英文。
- Must-have / Should-have / Could-have 分清楚。
- 每条需求要有可验收标准。
- 不要写代码。
```

### 3. PRD 已有，需要拆 feature 文档

```text
请使用 shuang-specs，读取 specs/prd.md，只拆 Must-have。

要求：
- 先输出 feature 拆分表和推荐顺序，等我确认。
- 每个 feature 生成 spec.md、plan.md、tasks.md。
- tasks 要适合 TDD，不要过大。
```

### 4. 某个 feature 文档已完成，需要实现

```text
请使用 shuang-tdd，实现 specs/00X-xxx 这个 feature。

要求：
- 先读取 AGENTS.md、constitution、spec.md、plan.md、tasks.md。
- 不重新规划需求。
- 按 tasks.md 逐项 TDD：Red -> Green -> Refactor。
- 完成后运行验证，并给出真实命令结果。
```

### 5. 功能写完，需要补测试和发布前判断

```text
请使用 shuang-router，基于当前 feature 的 diff、tasks.md 和测试结果，判断还缺哪类收尾测试。

要求：
- 只判类和路由，不直接乱补。
- 如果是后端缺口，路由到 shuang-backend。
- 如果是前端缺口，路由到 shuang-frontend。
- 如果是前后端接缝，路由到 shuang-slice。
- 如果是跨 feature 旅程，路由到 shuang-chain。
```

### 6. 要交给另一个 AI 或另一个会话继续

```text
请使用 shuang-prompt，基于当前项目、当前 feature 文档、已完成任务、未完成任务和验证结果，生成一份可以复制给另一个 AI 的交接提示词。

要求：
- 明确当前阶段。
- 明确必须先读哪些文件。
- 明确不要做什么。
- 明确下一步可验证目标。
```

短版：

```text
请使用 shuang-prompt，把这句话变成能交给 Claude Code/Codex/Cursor 的执行提示词：<一句话需求>
```

输出时先给“短命令意图卡”，再给可复制提示词；如果阶段或必读文件无法从项目判断，就只列最少待确认问题。

### 7. 要优化一段提示词

```text
请使用 enhance-prompt 优化下面这段提示词，让它可以稳定交给 Codex / Claude Code / Cursor 执行。

原始提示词：
<粘贴你的原始提示词>

要求：
- 保留我的真实目标，不要替我扩展范围。
- 输出一个可复制的最终提示词。
- 最终提示词必须包含角色、上下文、目标、输入文件、约束、执行方法、输出格式、停止规则和验证要求。
- 如果缺少项目路径、当前阶段或必须读取的文件，请列为“待确认”，不要编造。
```

如果这段提示词要交给另一个 AI 继续当前项目，再接着说：

```text
请使用 shuang-prompt，把刚才优化后的提示词项目化：读取当前项目 AGENTS.md、docs、specs、tasks/state/session，把真实路径、当前阶段、已完成/未完成事项和验证命令补进去。
```

### 8. 一轮任务结束，想把经验沉淀成 skill

```text
请按 docs/skill-evolution/README.md 做一次 evolution pass。

输入：
- 本轮任务目标
- 用户纠正/偏好
- 卡点和返工原因
- 验证命令和结果
- 哪个 skill 暴露了问题

要求：
- 先写 docs/skill-evolution/inbox/YYYY-MM-DD-<topic>.md。
- 不要直接改 SKILL.md。
- 判断是否满足长期化标准。
```

## 什么时候用哪个 skill

| 你现在要做什么 | 首选 |
|---|---|
| 不知道下一步该干嘛 | `shuang-flow` |
| 想法还模糊 | `shuang-brainstorm` |
| 要查竞品/资料/可行性 | `shuang-research` |
| 要正式产品需求 | `shuang-prd` |
| 要比较技术方案/开源项目 | `shuang-arch` |
| 要 UI/设计系统 | `shuang-design` |
| 要按截图/网页复刻前端 | `shuang-web-design-master` / `shuang-next` |
| 要把 PRD 拆成 feature | `shuang-specs` |
| 要执行 Spec-Kit 命令 | `speckit-*` |
| 要实现 feature | `shuang-tdd` |
| 要补测试闭环 | `shuang-router` |
| 要生成可跳转代码链路文档 | `shuang-code-handoff` |
| 要做 AI API/schema/env | `shuang-ai-api-builder` |
| 要优化粗糙提示词 | `enhance-prompt` |
| 要生成交接提示词 | `shuang-prompt` |
| 要生成项目指导文件 | `shuang-claude-md` |

## 新项目目录建议

```text
new-project/
├── AGENTS.md
├── CLAUDE.md
├── DESIGN.md
├── docs/
│   ├── vibe-coding-operating-map.md
│   └── skill-evolution/
│       ├── README.md
│       └── inbox/
├── specs/
│   ├── prd.md
│   ├── research/
│   └── 00X-feature-name/
│       ├── spec.md
│       ├── plan.md
│       ├── tasks.md
│       ├── state.md
│       └── session.md
└── .codex/
    ├── skills/
    └── skill-groups/
```

## 使用原则

- 不要一上来就让 AI 写代码；先判断阶段。
- 不要把所有功能一次性做完；先拆 Must-have。
- 不要跳过 `tasks.md` 直接实现复杂 feature。
- 不要把“手测通过”当成完成；收尾要走测试路由。
- 不要把一次性经验直接写进长期 skill；先写 evolution note。
- 每个新项目都要生成自己的 `AGENTS.md`，不要照搬旧项目。
