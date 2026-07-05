# Vibe Coding Operating Map

这份文档把当前项目的 39 个活跃 Codex skills、8 个功能分组和 11 个归档旧入口整理成一套可执行的 Vibe Coding 工作流。它的目标不是再解释概念，而是让每次开工时都能快速判断：现在处在哪个阶段、应该调用哪个 skill、需要读取哪些文件、应该产出什么、什么时候停下来确认。

## 项目定位

当前仓库是一个 Vibe Coding skill 工作区，包含三类资产：

| 资产 | 路径 | 作用 |
|---|---|---|
| 项目级 skills | `.codex/skills/` | 当前 Codex 可触发的流程能力 |
| 功能分组索引 | `.codex/skill-groups/` | 按阶段/功能查找 canonical skill |
| 归档旧入口 | `.codex/skill-archive/` | 历史提示词和旧课程入口对照 |
| Skill Studio | `Skill-Distiller/` | 从对话、偏好、任务样本生成初版 `SKILL.md`，并通过 `/evolve/theater` 演化改进 |

默认判断：

- 用户说“skill、提示词系统、Vibe Coding、Spec-Kit 流程、设计方法论”，优先落在当前仓库。
- 用户说“配置、Nacos、core、网关、UAA、ERP、AI 模块”，优先指向 `/Users/mac/Desktop/one-person/kuai-yan-fa`，但仍要重新读取真实项目文件。
- 用户说“Figma、Stitch、网页复刻、Next.js 页面”，优先指向 `/Users/mac/Desktop/vibe-coding/shuang-open-design` 或用户指定的前端项目。

## 一句话路线

Vibe Coding 的主线是：

```text
想法 -> 调研 -> PRD -> 架构 -> UI/设计 -> Spec-Kit 文档 -> TDD 实施 -> 测试闭环 -> 复盘沉淀 skill
```

每个阶段只解决自己该解决的问题。前面阶段不急着写代码，后面阶段不重新发明需求。

如果用户只给一句短提示词，`shuang-flow` 负责展开当前阶段的输入、产物、停止点和下一触发，不要求用户一次性把每个细节都写清楚。

如果是在已安装 `shuang-skill` 的业务项目里接到新需求，可以先运行 `node scripts/shuang-skill-manager.mjs start --request "<一句话需求>"`。它会先更新 managed skills 和脚本、运行 `project-doctor`，再生成 `docs/vibe-requests/*.md` 入口卡，完成结构校验和状态汇总，并直接打印可复制给 Codex 或 Claude 的下一轮提示词。

如果你还在 `shuang-skill` 源仓库里，直接带目标项目路径运行：`node scripts/shuang-skill-manager.mjs start --target /path/to/project --request "<一句话需求>"`。只想在已安装项目里跳过安装更新时，再用底层命令 `node scripts/vibe-request-start.mjs --request "<一句话需求>"`。

需要继续已有入口卡时，运行 `node scripts/shuang-skill-manager.mjs next --json`。它会汇总入口卡结构、队列阶段、下一轮可复制提示词和 `guard` 预检；需要只把最新入口卡交给另一个 AI 时，运行 `node scripts/shuang-skill-manager.mjs next --raw` 直接抽出提示词。需要拆开调试时，先用 `node scripts/create-feature-intake.mjs --request "<一句话需求>"` 生成入口卡，再分别运行 `node scripts/shuang-skill-manager.mjs request check`、`node scripts/shuang-skill-manager.mjs request status`、`node scripts/shuang-skill-manager.mjs request prompt --raw`。底层 `vibe-request-check/status/prompt` 脚本仍保留给低层排查。

一句话短命令到阶段、入口 skill、下一触发和停止点的标准路线见 `docs/short-command-routes.md`。维护路线后运行 `node scripts/short-command-route-check.mjs` 和 `node scripts/short-command-route-smoke.mjs`，安装到业务项目后路径是 `docs/shuang-skill/short-command-routes.md`。

端到端能力是否覆盖完整主线，以 `docs/vibe-coding-capability-matrix.md` 为准；它列出每个能力的入口 skill、关键产物、验证命令和安装范围。维护矩阵后运行 `node scripts/vibe-workflow-coverage-check.mjs`。

## Harness 阶段门四件套

每个阶段都按四件套执行：输入、产物、停止点、下一触发。短提示词进入系统时，先补齐当前阶段四件套，再决定是否继续。

| 阶段 | 输入 | 产物 | 停止点 | 下一触发 |
|---|---|---|---|---|
| 入口判断 | 用户原话、当前目录、已有指导文件 | 阶段判断、候选 skill | 目标跨阶段或风险边界不清 | `shuang-flow` 路由 |
| Brainstorm | 用户想法、现有 README/spec/docs | 目标、非目标、MVP、AC 草案 | 产品方向未确认 | `shuang-prd` 或 `shuang-research` |
| Research | 研究问题、约束、候选方案 | `specs/research/*` 和决策汇总 | 证据不足或路线分歧 | `shuang-prd` / `shuang-arch` |
| PRD | 调研结论、脑暴结果 | `specs/prd.md` | Must-have 未确认 | `shuang-specs` |
| Design | PRD、截图、Figma、参考站 | `DESIGN.md`、页面规范 | 视觉/交互方向未确认 | `shuang-specs` 或前端实施 |
| Spec-Kit | PRD、constitution、DESIGN | `spec.md`、`plan.md`、`tasks.md` | tasks 粒度或一致性未通过 | `speckit-analyze` / `shuang-tdd` |
| TDD 实施 | feature 文档、真实代码、任务清单 | 测试、代码、状态记录 | 测试或 review 未通过 | `shuang-router` |
| 测试闭环 | diff、测试结果、真实链路 | 缺口修复、回归证据、发布门 | 发布风险未收敛 | `shuang-prompt` / 发布 |
| 复盘进化 | 任务过程、失败点、验证证据 | evolution note、skill diff | 长期化标准未满足 | `shuang-evolve` |

## 阶段地图

| 阶段 | 目标 | 首选 skill | 输入 | 产出 | 停止点 |
|---|---|---|---|---|---|
| 0. 入口判断 | 判断用户真正处在哪个阶段 | `shuang-flow`、`shuang-skill-rules` | 用户原话、当前目录、已有文档 | 阶段判断和下一步 | 需求跨阶段或目标不清时先问 |
| 1. 想法澄清 | 明确痛点、用户、MVP、非目标、验收 | `shuang-brainstorm` | 用户想法、现有 README/spec/docs | 设计结论、问题清单 | 用户确认设计后再落文档 |
| 2. 立项调研 | 用证据判断是否值得做、怎么做 | `shuang-research` | 研究问题、竞品、约束 | `specs/research/01~05.md` | 汇总 `05-决策汇总.md` 后确认 |
| 3. PRD | 把调研和脑暴收敛成产品需求 | `shuang-prd` | 调研文档、设计结论 | `specs/prd.md` | Must-have 范围确认 |
| 4. 架构基线 | 多方案或开源项目取舍 | `shuang-arch` | 候选项目、调研结论 | `specs/research/06-架构基线决策.md` | 架构基线确认 |
| 5. UI/设计 | 生成页面规范、设计约束、DESIGN | `shuang-design`、`shuang-web-design-master`、`shuang-design-inject` | PRD、截图、Figma、Stitch、参考站 | `DESIGN.md`、页面规范、设计 tokens | 设计约束确认 |
| 6. Feature 文档 | 把 PRD 拆成可实施 feature | `shuang-specs`、`speckit-specify`、`speckit-clarify`、`speckit-plan`、`speckit-tasks` | `specs/prd.md`、constitution、DESIGN | `spec.md`、`plan.md`、`tasks.md` | `tasks.md` 完成后确认 |
| 7. 实施 | 严格按 tasks 做 TDD 开发 | `shuang-tdd`、`speckit-implement` | feature 文档、任务清单、项目代码 | 代码、测试、状态记录 | 测试和 review 前不宣称完成 |
| 8. 测试闭环 | 找出真实风险缺口并补齐 | `shuang-router`、`shuang-backend`、`shuang-frontend`、`shuang-slice`、`shuang-chain` | diff、测试结果、功能链路 | 回归测试、E2E、缺口报告 | 发布门通过 |
| 9. 交接与复盘 | 把过程转成提示词、规则、skill 改进 | `shuang-code-handoff`、`shuang-prompt`、`shuang-evolve`、Skill Studio `/evolve/theater` | 文档、review、失败点、用户偏好 | 代码链路文档 / handoff 文档、可复制提示词、evolution note、新/改 `SKILL.md` | skill 变更通过验证 |

## 课程资料到 Skill 的接入

学习资料可以强化这套路线，但只作为私有知识源：

1. 本地路径记录在 `.shuang-skill/course-sources.local.json`。
2. 跑 `node scripts/course-source-health.mjs` 检查 registry、路径和忽略规则。
3. 跑 `node scripts/course-source-inventory.mjs` 建立只读 inventory。
4. 每次选一个主题写 `docs/skill-evolution/inbox/*.md`。
5. 通过长期化标准后，才把原创规则升级到目标 skill。

公开仓库只保留提炼后的流程、检查表、模板和验证命令，不保存课程原文、PDF 正文、截图、zip 或模型文件。

## Skill 分组

### 调度与协作

| skill | 用途 |
|---|---|
| `shuang-flow` | 总调度，判断当前处于 Vibe Coding 哪个阶段 |
| `shuang-skill-rules` | skill 使用规则入口 |
| `shuang-prompt` | 生成复制给 Claude Code、Codex、Cursor 等 AI 的交接提示词 |
| `shuang-evolve` | 从任务复盘自动升级项目 skills |
| `shuang-claude-md` | 生成或刷新 `AGENTS.md`、`CLAUDE.md` 等项目指导文件 |

### 产品与调研

| skill | 用途 |
|---|---|
| `shuang-brainstorm` | 想法澄清、方案比较、设计收敛 |
| `shuang-research` | 0 到 1 产品立项调研 |
| `shuang-prd` | 生成结构化 PRD |
| `shuang-arch` | 架构基线 canonical 入口，负责源码对抗调研与 fork/复用/自建决策 |

### Spec-Kit 文档链

| skill | 用途 |
|---|---|
| `shuang-specs` | 基于 PRD 拆 Must-have features 并生成 feature 文档 |
| `speckit-specify` | 从自然语言生成或更新 feature spec |
| `speckit-clarify` | 扫描 spec 模糊点并写回澄清结果 |
| `speckit-plan` | 生成技术实现 plan |
| `speckit-tasks` | 生成可执行 tasks |
| `speckit-analyze` | 检查 spec、plan、tasks 一致性 |
| `speckit-checklist` | 生成自定义检查清单 |
| `speckit-constitution` | 创建或更新项目 constitution |
| `speckit-implement` | 按 tasks 执行实施 |
| `speckit-agent-context-update` | 刷新 agent context 中的 Spec Kit 区块 |
| `speckit-taskstoissues` | 把 tasks 转为 GitHub issues |
| `speckit-git` | feature 分支、提交、远程、校验、初始化等 Git 辅助总入口 |
| `source-command-spec-kit-patch` | 把项目约束写入 Spec Kit constitution |

### 设计与前端

| skill | 用途 |
|---|---|
| `shuang-design` | PRD 到 UI 原型、`DESIGN.md`、设计 tokens |
| `shuang-design-inject` | 已有 spec/plan/tasks 后补设计系统 |
| `shuang-web-design-master` | 参考站、截图、Figma、HTML 原型到高保真网页 |
| `figma-to-nextjs-migration` | 把 Vite/React Router 原型迁移到 Next.js |
| `shuang-prototype-to-next` | 从采集的原型资产重建 Next.js App Router 前端 |
| `shuang-next` | 截图、原型图或竞品页面到 Next.js 直接开发 |

### 实施与课程

| skill | 用途 |
|---|---|
| `shuang-tdd` | 实施阶段 canonical 入口，负责单 feature TDD、review、finish branch |

### 测试闭环

| skill | 用途 |
|---|---|
| `shuang-router` | 判断测试缺口类型并路由到对应 executor |
| `shuang-backend` | 后端真实数据、鉴权、并发、韧性补测 |
| `shuang-frontend` | 前端视觉、交互、可访问性、契约、回归补测 |
| `shuang-slice` | 局部前后端接缝测试 |
| `shuang-chain` | 多 feature 完整链路 E2E 旅程 |
| `shuang-blueprint` | 测试体系蓝本、风险分级、发布门 |

### 专项工具

| skill | 用途 |
|---|---|
| `shuang-code-handoff` | 生成可跳转的方法级代码链路文档 |
| `shuang-ai-api-builder` | AI 输出结构、流式 API route、Zod env 校验总入口 |
| `shuang-cut` | 本地视频剪映粗剪流程 |

### 归档入口

旧入口映射见 `.codex/skill-groups/90-archive/INDEX.md`。新任务不要触发归档目录里的 skill；只有需要解释历史提示词或课程资产时才读取。

## 每次开工的判断清单

开始前先问四个问题：

1. 用户要的是文档、代码、调研、设计、测试，还是提示词？
2. 当前项目有没有 `AGENTS.md`、`specs/prd.md`、`DESIGN.md`、feature `spec.md/plan.md/tasks.md`？
3. 这一步是否会影响架构、数据、鉴权、支付、发布或真实用户路径？
4. 这一步完成后应该交付文件、运行结果、截图、测试报告，还是下一阶段提示词？

根据答案选择：

- 还没想清楚：`shuang-brainstorm`
- 需要外部证据：`shuang-research`
- 要正式需求：`shuang-prd`
- 要选型或 fork：`shuang-arch`
- 要拆 feature 文档：`shuang-specs` 或 `speckit-*`
- 要 UI：`shuang-design` / `shuang-web-design-master`
- 要实现：`shuang-tdd`
- 要补测试：`shuang-router`
- 要知道本次需求的代码入口、方法行号和可跳转链路：`shuang-code-handoff`
- 要交给另一个 AI：`shuang-prompt`

## 阶段产物目录建议

建议每个业务项目保持以下目录结构：

```text
.
├── AGENTS.md
├── DESIGN.md
├── docs/
│   └── vibe-coding-operating-map.md
├── specs/
│   ├── prd.md
│   ├── research/
│   │   ├── 01-产品形态.md
│   │   ├── 02-数据来源.md
│   │   ├── 03-开源项目.md
│   │   ├── 04-实现方案.md
│   │   ├── 05-决策汇总.md
│   │   └── 06-架构基线决策.md
│   └── 00X-feature-name/
│       ├── spec.md
│       ├── plan.md
│       ├── tasks.md
│       ├── state.md
│       ├── session.md
│       └── retrospective.md
└── .codex/
    └── skills/
```

## 确认门

以下位置建议明确停下来等用户确认：

| 停止点 | 为什么 |
|---|---|
| 脑暴设计完成后 | 防止一开始就做错产品方向 |
| PRD Must-have 列表完成后 | 防止 feature 拆分过大 |
| 架构基线决策后 | 防止后续实现建立在错误选型上 |
| UI/DESIGN 完成后 | 防止前端实现与产品气质偏离 |
| feature 拆分列表完成后 | 防止多 feature 顺序错误 |
| `tasks.md` 完成后 | 防止任务粒度不适合 TDD |
| 实施前 | 确认是否要 worktree、是否要并行 agent |
| 测试闭环前 | 确认风险等级和发布门 |
| 复盘写入 skill 前 | 防止把一次性偏好固化为长期规则 |

## Skill Studio 的下一步产品化

### 创建与导出

建议下一步：

1. 增加“目标项目路径”输入。
2. 自动读取项目 `AGENTS.md`、README、`package.json`、已有 `specs/`。
3. 生成 `SKILL.md` 前先选择阶段：调研、PRD、设计、实施、测试、提示词。
4. 生成后做 lint：frontmatter、name、description、触发条件、禁止事项；可先跑 `node scripts/validate-skills.mjs` 做项目级结构检查。
5. 支持导出到 `.codex/skills/<skill-name>/SKILL.md`。

### 演化与复盘

当前定位：`Skill-Distiller/` 内的 `/evolve/theater` 根据任务反馈演化已有 skill。它是本项目第 9 阶段的可视化入口：每次任务结束后，把有长期价值的对话经验、失败点、用户偏好、验证证据整理成 evolution note，再决定是否升级到具体 skill。

建议下一步：

1. 输入一次真实任务的上下文、失败点、review、测试结果。
2. 判断问题属于：触发条件不清、流程缺步骤、产物格式弱、验证不足、边界过宽。
3. 先输出 `docs/skill-evolution/inbox/YYYY-MM-DD-<topic>.md`，而不是直接覆盖 `SKILL.md`。
4. 通过长期化标准后，再升级到 `.codex/skills/<skill>/SKILL.md` 或 `references/`。
5. 保存版本历史：`v1 -> v2 -> v3`。
6. 每次变更后跑结构校验和一次样例任务回放。

## 最小可执行工作流

如果只想用最小成本跑通一轮：

1. 用 `shuang-brainstorm` 把想法收敛成 1 个 MVP。
2. 用 `shuang-prd` 写 `specs/prd.md`。
3. 用 `shuang-specs` 只拆 1 个 Must-have feature。
4. 用 `speckit-analyze` 检查 `spec.md/plan.md/tasks.md`。
5. 用 `node scripts/spec-kit-handoff-check.mjs --feature specs/00X-feature-name` 检查 TDD 交接包。
6. 用 `shuang-tdd` 按 `tasks.md` 实施。
7. 用 `shuang-router` 判断补测方向。
8. 用 `shuang-prompt` 生成交接提示词。
9. 用 `shuang-evolve`、Skill Studio `/evolve/theater` 和 evolution note 把本轮踩坑变成 `docs/skill-evolution/inbox/` 下的沉淀。

这条路线比完整九阶段轻，但仍保留了 Vibe Coding 最重要的骨架：先定义，再实施，再验证，再复盘。

新项目接入、多路线选择、提示词优化路线和启动提示词见 `docs/new-project-quickstart.md`。
