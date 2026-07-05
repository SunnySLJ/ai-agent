# Hooks 与插件化路线图

这份文档说明哪些能力适合做成 hook 或插件，哪些仍应该保留为 skill。目标是让 `shuang-skill` 更稳定地支撑完整 Vibe Coding 项目交付，而不是把所有流程都做成会自动打断人的机制。

## 结论

可以做，但要分层。

```text
skill = 判断和执行流程
hook = 自动检查和阻断明显错误
plugin = 打包一组跨项目可复用能力
MCP = 连接外部系统和实时数据
CI = 发布前强制验证
```

最适合自动化的是“结构校验、阶段门禁、测试验证、复盘提醒”。不适合自动化的是“产品方向判断、技术方案取舍、是否长期升级 skill”这类需要上下文判断的事。

## 工作台能力边界

从 Claude Code、OpenClaw、Hermes 或其他 Agent 工作台资料里提炼规则时，先问四个问题：

| 问题 | 进入哪里 |
|---|---|
| 只是告诉 agent 该读哪些上下文、遵守哪些项目规则？ | `AGENTS.md` / `CLAUDE.md` / `@path` |
| 是当前项目真实存在的命令、脚本、MCP 或配置？ | skill、项目命令或插件说明 |
| 是危险动作、外部服务、发布或密钥相关操作？ | 用户确认门、验证门、CI |
| 是确定性检查，能低误伤自动判断？ | hook / CI；否则留在 skill |

不要把课程里的内部实现、工具名或工作台能力直接写成当前项目已具备的能力。只有能在当前项目文件中找到配置、脚本、manifest 或用户明确证据时，才写成可执行要求。

## 当前真实状态

当前仓库已经具备：

- `.codex/skills/`：39 个活跃项目级 skills。
- `Skill-Distiller/`：统一后的 Skill Studio。
- `shuang-evolve`：复盘、生成 evolution note、候选升级和验证闭环。
- `scripts/validate-skills.mjs`：skill 结构校验。
- `scripts/project-doctor.mjs`：项目级轻量健康检查入口，可挂到 hook 或 CI。
- `scripts/shuang-skill-manager.mjs guard`：手动提交前安全预检入口，当前调用 `project-doctor`，并被 managed `pre-push` hook 复用。
- `scripts/spec-kit-handoff-check.mjs`：Spec-Kit feature 文档转 TDD 前的交接包检查。
- `scripts/agent-workbench-boundary-check.mjs`：检查 `AGENTS.md`、`CLAUDE.md` 和关键 skill 文档里是否把未安装的 hook、plugin、MCP、slash command 或 subagent 写成“已启用/可直接使用”。
- `scripts/course-source-health.mjs`、`scripts/course-source-inventory.mjs`、`scripts/course-local-extract.mjs`、`scripts/course-extract-to-notes.mjs` 和 `scripts/create-course-evolution-note.mjs`：本机课程资料源健康检查、盘点、私有摘要、批量主题 note 和单主题 note 生成，默认不提交原始资料。
- `scripts/evolution-review.mjs`：批量整理 evolution inbox，输出升级候选、草稿补齐、停放关闭和生命周期证据缺口报告。
- `scripts/shuang-skill-manager.mjs hooks`：安全生成模板、激活、查看和移除本地 Git `pre-push` managed hook，默认不会覆盖已有 hook。

当前仓库默认还没有启用：

- 真实项目级 `.specify/extensions.yml` hook 配置。
- 已提交的 Git `pre-commit` / `pre-push` hook；只提供显式激活命令，不默认写入 `.git/hooks`。
- `.codex-plugin/plugin.json` 形式的独立 Codex plugin。
- GitHub Actions 发布门。

## 什么适合做成 hook

| 场景 | 推荐 hook | 是否阻断 | 原因 |
|---|---|---:|---|
| 修改 `.codex/skills/` 后 | `node scripts/validate-skills.mjs` | 是 | frontmatter、重复 name、分组缺失必须立刻发现 |
| 修改入口文档、Skill Studio 路由、删除旧目录后 | `node scripts/skill-studio-route-smoke.mjs` + `node scripts/project-doctor.mjs` | 是 | 防止新手入口、核心 skill、theater/library 路由断掉 |
| Spec-Kit `spec/plan/tasks` 生成后 | `speckit-analyze` + `node scripts/spec-kit-handoff-check.mjs --feature <dir>` | 建议先警告 | 文档一致性需要自动提醒，但不宜早期过度阻断 |
| feature 完成前 | 项目自己的 test/build/lint 命令 | 是 | 完成声明必须有验证证据 |
| 任务结束后 | 提醒生成 evolution note | 否 | 复盘需要判断，不能强制每次都升级 skill |
| 学习资料提炼后 | 检查 course inventory + skill validation | 否 | 可以提醒，但不应自动把课程内容写入长期 skill |
| push 前 | `project-doctor` + 关键 build/test | 是 | 推到远端前适合做硬门 |

## 什么适合做成插件

| 插件方向 | 能力 | 适合程度 | 说明 |
|---|---|---:|---|
| `shuang-skill-studio` plugin | 携带核心 skills、启动 Skill Studio、导出 skill | 高 | 适合把本仓库能力安装到新项目 |
| `shuang-project-bootstrap` plugin | 复制 skills、生成 `AGENTS.md` / `CLAUDE.md`、创建 docs/specs 目录 | 高 | 新项目接入最常用 |
| `shuang-evolution` plugin | 管理 inbox、生成升级候选、跑结构校验 | 中高 | 适合沉淀个人 workflow |
| `shuang-course-distiller` plugin | 管理私有课程源 registry、生成 redacted evolution note | 中 | 只打包脚本和规则，不打包课程原文 |
| `shuang-speckit-guards` plugin | 提供 `.specify/extensions.yml`、文档一致性检查、Git 辅助 | 中 | 需要先稳定 hook 事件和阻断策略 |
| `shuang-research-mcp` plugin | 打包搜索 MCP、调研模板、证据引用规范 | 中 | 适合调研阶段，但依赖外部服务 |

## 什么不应该先做成 hook

- `shuang-brainstorm`：它需要理解用户意图，不能静默触发。
- `shuang-prd`：PRD 是产品判断，不应由 hook 自动重写。
- `shuang-arch`：架构选型必须基于证据和确认门。
- `shuang-design`：设计风格需要用户确认。
- `shuang-evolve` 的真实写入：可以自动生成候选，但不能无门禁覆盖长期 skill。

这些能力应该继续由用户短提示触发，例如：

```text
用 shuang-flow 判断阶段并推进。
```

```text
用 shuang-evolve 复盘这次任务，把值得长期保留的经验升级到我的 skills。
```

## 推荐落地顺序

### Phase 1：轻量健康检查

先使用：

```bash
node scripts/project-doctor.mjs
node scripts/shuang-skill-manager.mjs guard --json
```

`project-doctor` 检查：

- 新手入口文档是否存在。
- `AGENTS.md` / `CLAUDE.md` 是否存在。
- `shuang-flow` / `shuang-evolve` 是否存在。
- `Skill Studio` 的 `/library` 和 `/evolve/theater` 路由是否存在。
- 旧 `Skill-Evolver/` 是否又出现。
- 工作台能力声明是否有真实项目证据：`node scripts/agent-workbench-boundary-check.mjs`。
- `node scripts/validate-skills.mjs` 是否通过。

`guard --json` 是同一组检查的提交前入口。它现在只调用 `project-doctor`，输出结构化状态和 blocker；它不会写 `.git/hooks`，也不会自动回流 skill。这样可以先让用户手动验证，再决定是否启用真实 hook。

### Phase 2：本地 Git hook

等 Phase 1 稳定后，可以把 `project-doctor` 放进 `pre-push`，不要先放进 `pre-commit`。原因是 `pre-push` 频率低，更适合跑结构检查和构建检查。

先查看状态：

```bash
node scripts/shuang-skill-manager.mjs hooks status
```

只生成模板，不激活 Git hook：

```bash
node scripts/shuang-skill-manager.mjs hooks template
```

显式激活：

```bash
node scripts/shuang-skill-manager.mjs hooks install
```

生成的 managed hook 内容等价于：

```bash
#!/bin/sh
# shuang-skill:managed-pre-push
root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$root" || exit 1
node scripts/shuang-skill-manager.mjs guard || exit 1
```

如果已有自己的 `.git/hooks/pre-push`，命令会拒绝覆盖；确认要替换时才使用：

```bash
node scripts/shuang-skill-manager.mjs hooks install --force
```

移除 managed hook：

```bash
node scripts/shuang-skill-manager.mjs hooks remove
```

移除命令只会删除带 `shuang-skill:managed-pre-push` 标记的 hook，避免误删用户自己的 hook。

如果要检查 Skill Studio build，再追加：

```bash
cd Skill-Distiller
OPENROUTER_API_KEY=placeholder pnpm build
```

### Phase 3：Spec-Kit extension hooks

当新项目已经使用 Spec-Kit，可以新增 `.specify/extensions.yml`，把 `before_plan`、`after_tasks`、`after_analyze` 等阶段接上项目检查。

`after_tasks` 阶段优先接：

```bash
node scripts/spec-kit-handoff-check.mjs --feature specs/00X-<feature>
```

原则：

- 先用 optional hook 提醒。
- 跑稳定后再改成 mandatory。
- 不自动 push。
- 不自动改长期 skill。

### Phase 4：Codex / Claude 插件化

等 skill 体系稳定后，再把下面能力打成 plugin：

- `skills/`：核心 workflow skills。
- `scripts/`：project doctor、evolution note、skill validation。
- `templates/`：新项目 `AGENTS.md`、`CLAUDE.md`、`.specify/extensions.yml` 模板。
- `docs/`：新手入门、项目接入、hooks 路线图。

插件化的目标是让新项目用一句安装命令获得完整工作流，而不是每次手动复制文件。

## 最推荐先做的 3 个自动护栏

1. `project-doctor`：检查当前仓库结构是否健康。
2. `pre-push`：推送前跑 `project-doctor` 和必要 build。
3. `evolution inbox review`：每周扫描 `docs/skill-evolution/inbox/`，列出哪些 note 应升级、关闭或继续观察。
4. `course-source review`：每周只读运行 `course-source-health`、`course-source-inventory`、`course-local-extract` 和 `course-extract-to-notes --dry-run`，发现新增资料后生成主题 note，不自动改 skill。

这四项最贴近当前项目目标：让你用短提示词推进开发，同时用自动护栏保证 skill 系统不会悄悄漂移。
