---
name: shuang-prompt
description: "中文主导的 AI 交接提示词生成 Skill。用于根据当前项目、用户需求、当前阶段和目标 AI 工具，生成可直接复制给 Claude Code、Codex、Cursor 或其他 AI 的文档驱动开发提示词；当用户说“帮我生成提示词”、“复制给 AI”、“让 AI 理解我的需求”、“当前在哪个步骤”、“按文档驱动开发继续”、“短提示词/一句话需求也能执行吗”时使用。English keywords: copyable prompt, AI handoff, prompt generator, short prompt, document-driven development."
---

# AI Handoff Prompt

用这个 Skill 生成“给另一个 AI 的输入”，不是直接执行任务。输出必须让目标 AI 明确：该读哪些项目文件、当前处于哪个阶段、要做什么、不能做什么、做到哪里停。

## 基本原则

- 中文为主；英文只用于命令、路径、工具名、技术关键词和目标 AI 名称。
- 先读项目真实文件，再生成提示词；不要凭印象编造项目背景、路径或阶段。
- 默认只输出可复制提示词，不改业务代码，不生成 spec/plan/tasks，不启动 worktree。
- 如果用户没有指定目标 AI，默认生成通用提示词；如果指定 Claude Code、Codex、Cursor，再加目标工具适配。
- 用户可以只给一句短命令；不要要求用户一次性补齐角色、文件、约束和验证。先生成短命令意图卡，再决定是否需要追问。
- 短命令阶段路线以 `docs/short-command-routes.md` 为准；安装到业务项目后路径是 `docs/shuang-skill/short-command-routes.md`。
- 如果当前环境启用了 Superpowers，可按用户和项目指令调用；如果提示词目标是外部 Claude Code，只在用户明确要求时描述目标侧 Superpowers 流程。
- 明确区分“当前对话可用工具”和“目标 AI 可用工具”。不要让目标 AI 使用未验证存在的 hook、plugin、MCP、slash command 或 subagent；除非项目文件、目标环境说明或用户明确提供了证据。

## 上下文预算

提示词是上下文选择结果，不是资料仓库。生成交接提示词时只放能让目标 AI 开始取证和执行的最小上下文：

- 保留用户原话、当前阶段、目标 AI、硬约束、停止点和验证要求。
- 项目背景优先放 `project-context-pack` 摘要、建议阅读顺序和真实路径；不把长文档全文塞进提示词。
- 大段历史、课程资料、review 记录和测试日志先压缩成“决策、约束、证据、待验证缺口”，再引用文件路径。
- 私有课程或本机摘要只写 source id 与原创规则；不写本机完整路径、课程原文、截图文字、key 或隐私。
- 如果提示词已经过长，拆成“上下文包摘要 -> 意图卡 -> 必读文件 -> 执行要求 -> 停止/验证规则”，不要继续堆材料。

## 工作流

1. **确认输入**
   - 尽量从用户话语和项目文件推断：目标 AI、当前阶段、feature 目录、期望产物。
   - 只有缺失信息会导致提示词不可用时才问用户。
   - 如果用户只给一句话，先整理“用户原话、推断阶段、目标 AI、候选必读文件、已知约束、阻塞缺口、停止点”；非阻塞缺口写进提示词让目标 AI 检查，不让用户逐项填表。
   - 推断阶段时参考 `docs/short-command-routes.md` 的阶段ID、入口 skill、下一触发和停止点；缺表或表不一致时先运行 `node scripts/short-command-route-check.mjs`。
   - 如果本轮维护了短命令路线、阶段 ID 或 prompt 路由规则，再运行 `node scripts/short-command-route-smoke.mjs`，确认真实短提示词仍会路由到正确 stage/skill。

2. **扫描项目上下文**
   - 如果项目里存在 `scripts/project-context-pack.mjs`，先运行 `node scripts/project-context-pack.mjs --json` 或读取 `.shuang-skill/project-context.local.json`，用它确定项目名、必读文件、framework signals 和建议阅读顺序。
   - 如果提示词来自 `node scripts/shuang-skill-manager.mjs start ...` 或 `node scripts/shuang-skill-manager.mjs request prompt --raw`，先检查输出是否已有“项目上下文包”段落；已有时把它作为项目背景摘要，不再要求用户手动补 README、package 或 specs。
   - 用 `rg --files` 找可用文档，不假设文件一定存在。
   - 按阶段读取必要文件，阶段路由见 [references/stage-routing.md](references/stage-routing.md)。
   - 如果用户给了具体 feature，优先读该目录下的 `spec.md`、`plan.md`、`tasks.md`、`state.md`、`session.md`。

3. **生成提示词**
   - 使用 [references/prompt-template.md](references/prompt-template.md) 的结构。
   - 短命令场景先输出一张简短意图卡，再输出可复制提示词；意图卡不替代提示词里的源文件、硬约束和停止规则。
   - 把“源文件路径”写进提示词，让目标 AI 自己读取；不要把长文档全文塞进提示词。
   - 明确停止规则：需要用户确认时停、缺少外部信息时停、完成本阶段后停。

4. **输出**
   - 先给一行使用说明，再给一个可复制的 Markdown 代码块。
   - 如果用户明确要短版提示词，可以压缩为一段，但仍必须保留源文件、阶段、任务、约束和停止规则。
   - 如果存在缺失上下文，在提示词前列出“需要你补充/确认”的最小清单。
   - 不要在同一轮顺手执行提示词里的任务。

## 阶段识别

常见阶段：

- `idea` / `research` / `prd`：想法澄清、调研、PRD。
- `design`：UI 原型、`DESIGN.md`、前端 constitution。
- `specs`：从 `specs/prd.md` 拆 Must-have feature，并生成 `spec.md`、`plan.md`、`tasks.md`。
- `arch`：基于 `specs/research/03-开源项目.md` 做架构基线决策。
- `implement` / `tdd`：某个 `specs/00X-*` 已有文档，进入实现。
- `review` / `finish`：代码审查、收尾、merge、复盘。

无法判断阶段时，输出一个“阶段确认版提示词”，让目标 AI 先读取项目文档并判断当前阶段，再等待用户确认。

## 质量检查

交付前检查：

- 如果用户给的是短命令，是否已经保留原话并输出意图卡。
- 是否包含角色、项目背景、当前阶段、源文件、任务、硬约束、输出格式、停止规则。
- 是否保留了用户的真实需求和不做范围。
- 是否避免让目标 AI 重新规划已锁定的 `plan.md` / `tasks.md`。
- 是否明确“先读文档再行动”。
- 如果项目安装了 `project-context-pack.mjs`，是否已经用它生成、读取或从 `request prompt` 自动注入的“项目上下文包”段落取得项目背景。
- 是否没有把当前 Codex 端禁止使用的工具写成当前端执行要求。
- 如果提示词声明 hook、plugin、MCP、slash command、subagent 已启用，是否有证据路径；项目里有 `scripts/agent-workbench-boundary-check.mjs` 时先跑它。
- 如果改动影响短提示词路线或 prompt 阶段推断，是否已经运行 `node scripts/short-command-route-check.mjs` 和 `node scripts/short-command-route-smoke.mjs`。
