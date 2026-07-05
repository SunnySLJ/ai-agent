# Course Distillation Reference

这份参考用于把本机课程、流程图、源码案例转成可维护的 skill 改进。它是 `shuang-evolve` 的学习资料分支，不替代任务复盘分支。

## 四层资料模型

| 层级 | 存放位置 | 是否提交 | 作用 |
|---|---|---|---|
| Raw source | 本机课程目录 | 否 | PDF、Excalidraw、Notebook、源码、zip、模型文件 |
| Local registry/inventory | `.shuang-skill/` | 否 | 记录 source id、标题、文件类型和可读信号 |
| Evolution note | `docs/skill-evolution/inbox/` | 是 | 记录主题、信号、原创规则和候选 diff |
| Skill diff | `.codex/skills/**` 或 `docs/**` | 是 | 只保存长期可复用的触发条件、步骤、检查和模板 |

公开仓库只允许进入第 3、4 层，且必须是原创总结。

## 推荐命令

先检查 registry 健康：

```bash
node scripts/course-source-health.mjs
```

再盘点：

```bash
node scripts/course-source-inventory.mjs
```

再按主题创建 note：

```bash
node scripts/create-course-evolution-note.mjs \
  --theme "<topic-slug>" \
  --sources "<source-id,source-id>" \
  --targets "<skill,skill>" \
  --rule "<future-facing reusable rule>"
```

需要先生成本机私有摘要时：

```bash
node scripts/course-local-extract.mjs --sources "<source-id,source-id>"
```

输出位于 `.shuang-skill/extracts.local/`，只作为本机中间材料，不提交。

如果要把 extract 里的 topicCandidates 批量转成缺失的 inbox note：

```bash
node scripts/course-extract-to-notes.mjs --dry-run
node scripts/course-extract-to-notes.mjs
```

脚本会跳过已存在的同主题 note，只为新主题创建公开 evolution note。

主题示例：

| 主题 | 来源 | 目标 |
|---|---|---|
| `skill-protocol` | Agent Skills / OpenClaw | `shuang-skill-rules`, `shuang-evolve` |
| `harness-stage-gates` | Harness / Spec-Kit / OpenSpec | `shuang-flow`, `shuang-tdd` |
| `file-first-memory` | OpenClaw 记忆系统 | `shuang-evolve`, `shuang-flow` |
| `agent-workbench-boundaries` | Claude Code 源码解读 | `shuang-claude-md`, `shuang-skill-rules` |
| `ocr-ingestion` | DeepSeek-OCR / PDF 资料 | 未来 OCR/文档抽取 skill 或 `shuang-evolve` |

## 升级判断

课程资料满足下面至少两条，才从 note 升级到 skill：

- 能缩短用户未来提示词。
- 能形成明确触发句式。
- 能作为阶段门、验证门、scope guard 或输出模板。
- 能跨两个以上项目复用。
- 能避免以前已经出现过的返工、误触发或范围漂移。

不升级：

- 课程讲义原文、长摘录、截图内容。
- 只适合某个课程案例的具体业务事实。
- 未验证的模型、工具、框架宣传结论。
- 大源码树的具体实现细节，除非已转成通用工程规则。

## PDF/OCR 路线

PDF 和图片资料默认不进入公开仓库。需要抽取时：

1. 运行 `node scripts/course-local-extract.mjs --sources "<source-id>"`，在本机生成 `.shuang-skill/extracts.local/` 下的私有摘要。
2. 摘要脚本必须对 API key、token、password、Authorization、`sk-*` 等敏感片段做 redaction。
3. 每份资料只输出标题、章节、关键词和 3-5 条原创规则。
4. 公开 evolution note 只引用 source id 和主题，不放原文。
5. 如果抽取工具需要额外依赖，先写进本地脚本说明，不把模型权重或缓存纳入 Git。
6. 需要真正 OCR/PDF 正文抽取时，先在本机私有目录生成摘要，再人工确认没有隐私、密钥、课程原文长摘录，最后只把原创规则升级到 skill。
7. 更新 skill 后跑 `node scripts/validate-skills.mjs`；它会拦截把 `description` 写成步骤链的明显 progressive-loading 违规。

## 三类高价值提炼

### File-first memory

适用来源：OpenClaw 记忆系统、数字员工、长期上下文资料。

提炼时先区分五类内容，任何资料都先进入正确槽位，再决定是否升级：

| 槽位 | 应放位置 | 说明 | 不应放入 |
|---|---|---|
| 项目行为规则 | `AGENTS.md` / `CLAUDE.md` | 当前项目怎么启动、验证、协作 | 跨项目方法论、课程原文 |
| 用户长期偏好 | 用户记忆或项目指导文件 | 只保存稳定偏好 | 临时聊天噪声、一次性命令 |
| 任务复盘 | `docs/skill-evolution/inbox/` | 先审查，再决定是否长期化 | 未验证的结论、私有资料正文 |
| 跨项目 workflow | `.codex/skills/**` | 只有跨项目复用才进入 skill | 单项目配置、具体业务事实 |
| 大段案例/原理 | `docs/` 或 `references/` | 保持 `SKILL.md` 短 | 会被 agent 每次强制加载的正文 |

规则：记忆类课程资料先变成文件化上下文协议，再通过 inbox 判断是否升级 skill；不要把一次性业务事实直接塞进通用 skill。

升级顺序：

1. 先判断资料属于哪个槽位。
2. 能稳定复用但还没验证的，写 `docs/skill-evolution/inbox/*.md`。
3. 只影响当前项目的，写项目 `AGENTS.md` / `CLAUDE.md` 或相关 docs。
4. 能跨项目改变 agent 行为的，才升级 `.codex/skills/**`。
5. 任何槽位都不得保存真实 key、隐私、课程原文、PDF 正文或截图正文。
6. 改完入口指导文件或核心 workflow skill 后，跑 `node scripts/memory-placement-check.mjs`。

### Agent workbench boundaries

适用来源：Claude Code 源码解读、工作台、hooks、plugins、多 agent、权限系统资料。

提炼时只保留四类可迁移规则：

- 上下文边界：什么进入 `AGENTS.md`，什么只作为 `@path` 引用。
- 工具边界：哪些是当前项目真实可用命令，哪些只是课程工具名。
- 权限边界：危险命令、外部服务、发布动作必须有验证或用户确认。
- 自动化边界：能确定检查的做 hook/CI，需要判断的保留为 skill。

准入门：

| 课程信号 | 可升级形式 |
|---|---|
| 上下文组织方式 | 项目指导文件章节或 `@path` 规则 |
| 工具/插件/MCP 名称 | 只有本项目真实存在时写成执行要求，否则写成路线图 |
| 权限、密钥、发布、外部服务 | 用户确认门、验证门或 CI 发布门 |
| 可重复结构检查 | hook / CI / `project-doctor` |
| 需要产品或架构判断 | skill 流程和确认门 |

规则：不要把源码内部实现细节、课程工具名或别的工作台能力直接写成通用 agent 行为要求；先转成项目指导文件、插件路线或验证门。

### OCR ingestion safety

适用来源：PDF、图片课件、OCR 项目、论文、模型权重和 zip 包。

提炼顺序：

1. 只在本机 `.shuang-skill/extracts.local/` 生成私有摘要。
2. 私有摘要也要脱敏；发现 key/token/password/Authorization 样式文本时写 `<redacted>`。
3. 公开 note 只写 source id、主题、原创规则和目标 skill。
4. 抽取脚本必须默认跳过模型权重、缓存、zip 内大文件和可能含密钥的文件。
5. 如果需要引用资料原文，保持极短摘录，并优先改写为自己的工程规则。
6. 不把 OCR 模型权重、缓存、截图、PDF 正文、zip 包或抽取后的全文提交到 Git。

规则：OCR 资料是输入源，不是仓库内容；公开仓库只保留可执行 workflow。

## 输出约束

写入 `SKILL.md` 时只放影响未来行为的内容；长路线图放 `references/` 或 `docs/`。每次升级后必须跑：

```bash
node scripts/validate-skills.mjs
node scripts/course-source-health.mjs
node scripts/course-source-inventory.mjs
node scripts/course-local-extract.mjs --sources "<changed-source-id>"
node scripts/course-extract-to-notes.mjs --dry-run
```
