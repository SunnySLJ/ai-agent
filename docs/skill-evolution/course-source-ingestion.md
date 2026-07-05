# 课程资料接入与 Skill 提炼路线

这份文档说明如何把本机学习资料转成可维护的 skill 改进。目标是吸收方法论，不复制课程原文、PDF、截图、源码包或模型文件。

## 原则

- 原始资料只保留在本机，不提交到 GitHub。
- 只沉淀原创总结：触发条件、流程步骤、检查清单、反例、验证命令和模板。
- 所有长期规则先进入 `docs/skill-evolution/inbox/`，满足长期化标准后再改 `SKILL.md` 或 `references/`。
- PDF、图片、zip、模型权重、大源码树默认不直接纳入；需要时单独做抽取任务。
- 公开文档里不写 API key、账号、个人隐私，也不粘贴大段课件内容。

## 本地注册表

把私有资料路径放在本地文件：

```text
.shuang-skill/course-sources.local.json
```

可参考：

```text
docs/skill-evolution/course-source-registry.example.json
```

`.shuang-skill/` 已被 `.gitignore` 忽略，用来保存本机私有资料索引和扫描结果。

## 健康检查命令

```bash
node scripts/course-source-health.mjs
```

检查内容：

- `.shuang-skill/course-sources.local.json` 是否存在且 JSON 合法。
- source id 是否重复。
- 资料路径是否为绝对路径且存在。
- `targetSkills` 是否为空或明显异常。
- `.shuang-skill/` 是否被 `.gitignore` 忽略。

这个命令会输出本机私有路径；不要把 `--json` 输出提交到公开仓库。

## 盘点命令

```bash
node scripts/course-source-inventory.mjs
```

需要给下游脚本或另一个 agent 读取完整盘点时，用纯 JSON 输出：

```bash
node scripts/course-source-inventory.mjs --json
```

默认读取：

```text
.shuang-skill/course-sources.local.json
```

默认输出：

```text
.shuang-skill/course-source-inventory.local.json
```

脚本只统计文件类型、样例文件名、Markdown/Notebook 标题、Excalidraw 文本片段和 PDF 文件元信息，不抽取 PDF 正文。

## 私有摘要抽取

如果需要把 Markdown、Notebook、Excalidraw、PDF/图片待处理清单整理成本机摘要，用：

```bash
node scripts/course-local-extract.mjs --sources "deepseek-ocr-2-quickstart"
```

默认输出：

```text
.shuang-skill/extracts.local/
```

这个目录只保存本机私有摘要和待 OCR/PDF 清单，已被 `.gitignore` 的 `.shuang-skill/` 规则覆盖，不提交。

安全边界：

- 摘要脚本会对 API key、token、password、Authorization、`sk-*` 等敏感片段做 `<redacted>` 脱敏。
- PDF 和图片默认只记录待处理清单，不抽正文、不做 OCR。
- 真正需要 OCR/PDF 正文时，先在 `.shuang-skill/` 生成本地摘要，再人工确认没有隐私、密钥、课程原文长摘录。
- 公开仓库只提交原创规则、检查表和模板，不提交抽取全文、截图、模型权重、缓存或 zip。

## 批量生成主题 note

当 `.shuang-skill/extracts.local/*.json` 里已有 `topicCandidates`，可以先预览：

```bash
node scripts/course-extract-to-notes.mjs --dry-run
```

确认后生成缺失主题 note：

```bash
node scripts/course-extract-to-notes.mjs
```

脚本会跳过已经存在的同主题 note，公开 note 只保存 source id、统计信号和原创规则。

## 主题 note 命令

当你已经确定要提炼的主题时，用：

```bash
node scripts/create-course-evolution-note.mjs \
  --theme "file-first-memory" \
  --sources "openclaw-digital-worker,openclaw-memory-practice" \
  --targets "shuang-evolve,shuang-flow" \
  --rule "把记忆类课程资料先提炼为文件化复盘协议，再决定是否升级 skill。"
```

这个脚本会读取本地 registry/inventory，但公开 note 只保存 source id、标题、文件类型和原创规则，不保存本机完整路径和课程原文。

更详细的提炼规则见 `.codex/skills/shuang-evolve/references/course-distillation.md`。

## 资料到 Skill 的路由

| 资料类型 | 适合提炼的问题 | 首选目标 |
|---|---|---|
| Agent Skill 入门 / Skill 开发 | 什么时候触发 skill、如何写 description、如何渐进加载 | `shuang-skill-rules`、`shuang-evolve` |
| Harness Engineering / Hermes Agent | 如何把需求、计划、执行、验证做成输入、产物、停止点、下一触发明确的 harness | `shuang-flow`、`shuang-tdd`、`shuang-router` |
| Claude Code 源码解读 | 上下文、工具、权限、hooks、插件、多 agent 的工作台边界 | `shuang-claude-md`、`shuang-skill-rules` |
| OpenClaw 记忆系统 / 数字员工 | 文件化记忆、技能协议、可解释上下文、复盘沉淀 | `shuang-evolve`、`shuang-flow` |
| Spec-Kit / OpenSpec 流程图 | 从 brainstorm 到 spec、plan、tasks、TDD 的阶段门 | `shuang-flow`、`shuang-specs`、`shuang-tdd` |
| 工业级案例 | PRD、架构、接口、测试、上线的真实项目样板 | `shuang-prd`、`shuang-arch`、`shuang-blueprint` |
| OCR / PDF 资料处理 | 课件、论文、截图转本机私有摘要，并脱敏后提炼原创规则 | 后续新增或复用文档/OCR 类 skill |

## 提炼流程

1. 跑 health，确认 registry 和 `.shuang-skill/` 安全边界健康。
2. 跑 inventory，确认资料存在、类型和可读标题。
3. 每次只选 1 个主题，例如“Skill 触发协议”或“Spec-Kit 阶段门”。
4. 如果需要更细信号，跑 `course-local-extract.mjs` 生成本机私有摘要。
5. 如果 extract 已有 topicCandidates，可用 `course-extract-to-notes.mjs` 批量生成缺失主题 note。
6. 用 `create-course-evolution-note.mjs` 写单个 evolution note，记录来源类别、可复用规则、目标 skill 和验证方式。
7. 判断长期化标准：是否高频、是否有触发句、是否能减少返工、是否能验证。
8. 对候选 note 跑 `node scripts/evolution-promotion-package.mjs --note <note>`，确认推荐动作、目标位置和课程资料边界。
9. 升级前做渐进加载审查：`description` 只写触发条件，`SKILL.md` 只放核心执行规则，课程细节、长案例和背景解释放 `references/` 或 `docs/`。
10. 可长期化时做最小 diff：只改会改变未来 agent 行为的触发条件、阶段门、scope guard、验证门或输出模板。
11. 跑 `node scripts/validate-skills.mjs`，确认 description 仍是触发条件，没有变成 `先...再...最后...` 的流程摘要。
12. 如果这些 skill 已安装到业务项目，再用 `node scripts/shuang-skill-manager.mjs install --target <project>` 同步过去。

## 第一批优先级

1. `Agent Skill / Agent Skills`：强化 skill 触发、description、渐进加载和验证。
2. `Spec-Kit + Superpowers / OpenSpec` 流程图：强化阶段门和从 tasks 到 TDD 的转接。
3. `Harness Engineering / Hermes Agent`：强化执行 harness、四件套阶段门、并行 agent、验证门。
4. `OpenClaw` 记忆系统：强化文件化记忆和复盘进化。
5. `Claude Code` 源码解读：强化项目指导文件、工具权限、hooks/plugins 边界。

## 已建立的主题队列

| 主题 | note | 目标 |
|---|---|---|
| Skill 触发与渐进加载 | `docs/skill-evolution/inbox/2026-06-24-skill-protocol-progressive-loading.md` | `shuang-skill-rules`, `shuang-evolve` |
| Harness 阶段门 | `docs/skill-evolution/inbox/2026-06-24-harness-stage-gates.md` | `shuang-flow`, `shuang-tdd` |
| 课程资料安全接入 | `docs/skill-evolution/inbox/2026-06-24-course-source-ingestion.md` | `shuang-evolve` |
| 文件化记忆 | `docs/skill-evolution/inbox/2026-06-24-file-first-memory.md` | `shuang-evolve`, `shuang-flow`, `shuang-claude-md` |
| Agent 工作台边界 | `docs/skill-evolution/inbox/2026-06-24-agent-workbench-boundaries.md` | `shuang-claude-md`, `shuang-skill-rules`, `shuang-prompt` |
| OCR/PDF 安全抽取 | `docs/skill-evolution/inbox/2026-06-24-ocr-ingestion-safety.md` | `shuang-evolve` |
| Spec-Kit 交接协议 | `docs/skill-evolution/inbox/2026-06-24-spec-kit-handoff.md` | `shuang-flow`, `shuang-specs`, `shuang-tdd`, `shuang-prompt` |
| 短提示词路线门 | `docs/skill-evolution/inbox/2026-06-24-short-command-route-gate.md` | `shuang-flow`, `shuang-prompt`, `shuang-evolve` |
| 上下文预算提示词 | `docs/skill-evolution/inbox/2026-06-25-context-budgeted-prompt.md` | `shuang-prompt` |
