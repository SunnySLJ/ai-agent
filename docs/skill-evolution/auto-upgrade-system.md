# Skill 自动升级进化系统

这份文档解释当前项目如何让 skills 持续进化，最终让你用很短的提示词，就能触发完整的 Vibe Coding 工作流。

## 1. 总目标

这个项目的长期目标不是收集一堆静态提示词，而是形成一个会复盘、会合并、会验证、会升级的个人工作流系统。

目标状态：

```text
你输入简单命令
-> shuang-flow 判断阶段
-> 对应 skill 执行专业流程
-> 任务完成后 shuang-evolve 复盘
-> 有价值经验升级到 skills
-> 下一次同类任务更稳定、更少解释、更少返工
```

最终你只需要说类似：

```text
帮我做一个新功能，按我的 Vibe Coding 流程走。
```

或者：

```text
复盘这次任务，把值得长期保留的经验升级进我的 skills。
```

系统就能自动找到阶段、调用 workflow、产出文档、实施、测试、交接，并在结束后继续进化。

## 2. 核心原理

Skill 进化的本质是把“临时聊天经验”变成“长期可触发的工作流规则”。

大模型本身不会天然记住你每一次纠正，也不会稳定区分哪些经验该长期保留。`shuang-evolve` 的作用是给这个过程加上结构：

1. **提取信号**：从任务、失败、用户纠正、验证结果里找可复用经验。
2. **写入 inbox**：先生成 `docs/skill-evolution/inbox/*.md`，避免直接污染长期 skill。
3. **准入判断**：只有满足长期化标准，才允许改 `SKILL.md` 或 `references/`。
4. **最小升级**：只改真正影响未来行为的触发条件、步骤、检查或输出格式。
5. **验证闭环**：跑 `node scripts/validate-skills.mjs`，必要时跑应用 build。
6. **持续复利**：每次任务只升级一点点，长期累积成个人工作系统。

这不是“把所有聊天都记住”，而是把经过筛选的高价值规则放进正确位置。

## 3. 系统组成

| 组件 | 路径 | 作用 |
|---|---|---|
| 运行时 skills | `.codex/skills/` | Codex 可发现和触发的 workflow |
| 进化 skill | `.codex/skills/shuang-evolve/SKILL.md` | 自动复盘、生成 note、升级 skill、跑验证 |
| 进化 inbox | `docs/skill-evolution/inbox/` | 暂存任务经验，先审查再升级 |
| 进化脚本 | `scripts/create-evolution-note.mjs` | 快速生成标准 evolution note |
| 新手就绪检查 | `scripts/project-readiness.mjs` | 集中运行 doctor、validate 和短提示词路由烟测，输出 `drill` 演练和下一步一句话需求命令 |
| 项目需求总入口 | `scripts/project-start.mjs` | 给目标项目和一句话需求，串联安装/更新、`project-doctor`、入口卡、校验、状态汇总和可复制提示词 |
| 新手端到端演练 | `scripts/beginner-drill.mjs` | 串联安装/更新、readiness、`start --request`、`request prompt --raw`、context 和 system-audit |
| 下一步 manager 入口 | `scripts/shuang-skill-manager.mjs next` | 对已有入口卡统一执行 check、status、prompt 和 guard，输出下一轮可复制提示词 |
| 需求队列 manager 排查入口 | `scripts/shuang-skill-manager.mjs request` | 对已有或人工修改的入口卡分别执行 check、status、prompt，用于拆分排查 |
| 短需求底层入口 | `scripts/vibe-request-start.mjs` | 在已安装项目里把一句话需求串联成入口卡、校验、状态汇总和可复制提示词 |
| 队列状态脚本 | `scripts/evolution-inbox-status.mjs` | 识别 `draft`、`ready`、`parked`、`promoted` 和优先级 |
| 升级候选包脚本 | `scripts/evolution-promotion-package.mjs` | 把单个 ready note 转成目标、门禁、推荐动作和验证命令清单 |
| 课程源健康检查 | `scripts/course-source-health.mjs` | 检查本机课程 registry、路径存在性和 `.shuang-skill/` 忽略规则 |
| Inbox 批量整理 | `scripts/evolution-review.mjs` | 汇总 promote candidates、draft fixes、close candidates、parked revisit 和 lifecycle evidence gaps |
| 能力覆盖矩阵检查 | `scripts/vibe-workflow-coverage-check.mjs` | 检查从需求到发布复盘的能力矩阵是否覆盖入口 skill、关键产物、验证命令和安装范围 |
| 工作台边界检查 | `scripts/agent-workbench-boundary-check.mjs` | 防止把未安装的 hook、plugin、MCP、slash command 或 subagent 写成当前项目已具备能力 |
| 记忆放置检查 | `scripts/memory-placement-check.mjs` | 防止把任务复盘、用户画像或本机业务路径塞进入口指导文件和通用 skill |
| 安装清单一致性检查 | `scripts/managed-artifacts-check.mjs` | 防止新 helper 脚本或文档只在源仓库可用、安装脚本/目标自检/quickstart 漏同步 |
| 多项目安装审计 | `scripts/project-audit.mjs` | 审计已安装项目的 managed 文件、doctor、validate、hook 状态和可选新手 readiness/新入口/request 队列/`next`/短提示词路由烟测 |
| 新项目安装烟测 | `scripts/fresh-install-smoke.mjs` | 从临时项目真实安装，并运行目标项目 `project-doctor`、readiness、入口卡 `request prompt`、`next` 和短命令路由烟测，验证新手接入路径 |
| 同步回流烟测 | `scripts/sync-back-smoke.mjs` | 用临时源和临时目标验证目标项目里的 skill/note 可以 dry-run 和 apply 回源仓库 |
| Skill Studio 路由烟测 | `scripts/skill-studio-route-smoke.mjs` | 启动临时 Next dev server，验证 `/`、`/library`、`/evolve/theater` 和主页入口链接 |
| Hook 管理测试 | `scripts/shuang-skill-manager-hooks.test.mjs` | 验证 `pre-push` managed hook 的模板生成、显式安装、备份、状态和移除保护 |
| 结构校验 | `scripts/validate-skills.mjs` | 检查 frontmatter、重复 name、分组索引 |
| Skill Studio | `Skill-Distiller/` | 生成、演化、导出 skill 的本地 Next.js 应用 |
| 演化剧场 | `/evolve/theater` | 可视化理解 Actor -> Reflection -> Proposal -> Apply -> Version |

## 4. 为什么不能直接自动覆盖 SKILL.md

直接自动覆盖很危险，因为 skill 是未来 agent 的行为规则。一次错误升级会造成长期误触发。

常见污染：

- 把某个临时项目路径写成通用规则。
- 把一次性业务事实写进所有项目都会触发的 skill。
- 因为一次失败过度收紧范围，导致以后正常任务被拒绝。
- 把未经验证的猜测写成硬规则。
- 在多个 skill 里重复写同一规则，未来发生冲突。

所以本项目采用“半自动、带门禁”的升级方式：

```text
自动发现 -> 自动写 note -> 自动生成候选 diff -> 满足标准才自动应用 -> 自动验证
```

真正写入长期 skill 前，必须能说明：

- 这条规则为什么值得长期保留。
- 它应该属于哪个 skill。
- 它会在什么情况下触发。
- 它如何验证没有破坏结构。

## 5. 五层进化级别

| 级别 | 动作 | 说明 |
|---|---|---|
| L0 | 只写 inbox note | 有信号，但还不够稳定 |
| L1 | 更新 `references/` | 细节较长，适合作为参考资料 |
| L2 | 更新 `SKILL.md` | 触发条件、核心步骤、验证门必须改变 |
| L3 | 新增 skill | 新能力独立，放进旧 skill 会变臃肿 |
| L4 | 合并或归档 skill | 多个入口重复、误触发、路线冲突 |

这次已安装的是 L3 能力：新增 `shuang-evolve`，专门负责进化闭环。

## 6. 一次自动升级的完整流程

### 第一步：触发

你可以说：

```text
用 shuang-evolve 复盘这次任务，把值得长期保留的经验升级到我的 skills。
```

或者：

```text
这次的问题以后不要再犯，帮我写进 skill。
```

### 第二步：收集证据

Agent 会读取：

- 用户本轮要求。
- 已修改文件。
- 失败和修复过程。
- build/test/validate 输出。
- 用户明确纠正。
- 相关 `SKILL.md` 和 `references/`。

不会读取：

- `.env.local`
- API key
- 与任务无关的私人文件

### 第三步：写 evolution note

标准路径：

```text
docs/skill-evolution/inbox/YYYY-MM-DD-<topic>.md
```

可以用脚本生成模板：

```bash
node scripts/create-evolution-note.mjs \
  --topic "frontend-build-verification" \
  --skill "shuang-frontend" \
  --task "前端 build 通过前不能声称完成"
```

### 第四步：判断是否长期化

先跑队列状态：

```bash
node scripts/evolution-inbox-status.mjs --limit 8
node scripts/evolution-review.mjs
```

状态含义：

- `draft`：信息不完整，先补 Context/Signal/Reusable Rule/Validation。
- `ready`：信息完整，可以按长期化标准判断是否升级。
- `parked`：值得保留但证据不足，等待下一次真实任务验证。
- `promoted`：已落地并验证，不再占用升级优先队列。

默认排序会把 `ready` 和 `draft` 放在前面，把 `parked` 和 `promoted` 放到后面。

`evolution-review` 用于周期性整理：它会把 ready note 转成升级候选清单，把 draft note 列成补齐清单，把一次性业务事实或临时路径列为 close candidates，并检查 promoted note 是否缺少生命周期证据。

选中一个 `ready` note 后，先生成升级候选包：

```bash
node scripts/evolution-promotion-package.mjs --note docs/skill-evolution/inbox/<note>.md
```

候选包会列出：

- 目标 skill、reference、docs。
- note 完整性、最小证据、触发边界、验证计划、课程资料边界。
- 推荐动作：`promote`、`promote-after-validation-plan`、`complete-note`、`keep-parked` 或 `already-promoted`。
- 本次升级应该跑的验证命令。

如果 recommendation 不是 `promote`，先按候选包补 note、补验证计划或停放，不要直接改长期 skill。

至少满足两条：

- 同类问题未来很可能再次出现。
- 有明确触发句式。
- 能转成步骤、检查表或验证命令。
- 能降低返工、误触发或范围漂移。
- 用户明确表达这是长期偏好。

### 第五步：选择升级位置

常见选择：

- 触发边界不清：改目标 `SKILL.md` 的 `description`。
- 流程缺步骤：改目标 `SKILL.md` 的工作流。
- 示例或细节太长：放到 `references/`。
- 多个 skill 重复：更新 canonical skill，归档旧入口。
- 新能力独立：新增一个 skill。

### 第六步：应用最小 diff

原则：

- 只改与证据直接相关的内容。
- 不做顺手大重构。
- 不把一次性路径和业务事实写进通用 skill。
- 中文为主，命令、路径、工具名保留英文。

### 第七步：验证

每次 skill 变更后必须跑：

```bash
node scripts/evolution-promotion-package.mjs --note docs/skill-evolution/inbox/<note>.md
node scripts/project-audit.test.mjs
node scripts/project-readiness.test.mjs
node scripts/project-start.test.mjs
node scripts/beginner-drill.test.mjs
node scripts/shuang-skill-manager-request.test.mjs
node scripts/skill-studio-route-smoke.mjs
node scripts/vibe-request-start.mjs --request "示例需求" --out-dir .shuang-skill/tmp-intake --force
node scripts/shuang-skill-manager.mjs request prompt --raw --dir .shuang-skill/tmp-intake
node scripts/agent-workbench-boundary-check.mjs
node scripts/memory-placement-check.mjs
node scripts/vibe-workflow-coverage-check.mjs
node scripts/project-readiness.mjs
node scripts/managed-artifacts-check.mjs
node scripts/short-command-route-check.mjs
node scripts/short-command-route-smoke.mjs
node scripts/shuang-skill-manager-hooks.test.mjs
node scripts/fresh-install-smoke.test.mjs
node scripts/fresh-install-smoke.mjs
node scripts/sync-back-smoke.mjs
node scripts/validate-skills.mjs
node scripts/evolution-inbox-status.mjs --limit 8
node scripts/evolution-review.mjs --json
```

涉及课程资料源、私有摘要或学习资料提炼时，再跑：

```bash
node scripts/course-source-health.mjs
node scripts/course-source-inventory.mjs --json
node scripts/course-extract-to-notes.mjs --dry-run
```

如果改了 Skill Studio 代码，再跑：

```bash
node scripts/skill-studio-route-smoke.mjs
cd Skill-Distiller
OPENROUTER_API_KEY=placeholder pnpm build
```

### 第八步：更新 note 生命周期

验证通过后，在对应 note 末尾追加：

```markdown
## Lifecycle

- Status: promoted
- Promoted by: `<commit-or-change-ref>`
- Evidence: <验证命令或落地说明>
```

如果暂时不升级，使用 `Status: parked`，并写清“还缺什么证据”。这一步能让 inbox 保持可行动，而不是反复把已处理 note 当成下一步。

## 7. 每天怎么用

### 开工前

```text
用 shuang-flow 判断我现在在哪个阶段，然后按 Vibe Coding 流程推进。
```

### 需求阶段

```text
用 shuang-brainstorm 帮我把这个想法收敛成 MVP，先不要写代码。
```

### 实施阶段

```text
按 shuang-tdd 执行这个 feature，完成前必须跑验证。
```

### 收尾阶段

```text
用 shuang-router 判断测试缺口，然后补齐发布前必须验证的部分。
```

### 复盘进化阶段

```text
用 shuang-evolve 复盘这次任务，把值得长期保留的经验升级到我的 skills。
```

### 周期性整理

```text
用 shuang-evolve 检查我的 skills 有没有重复、过时、触发不清的地方，给我升级候选清单。
```

## 8. 它如何让你变强

普通提示词的缺点是：你每次都要重新解释方法。

这个项目的目标是把方法沉淀成系统：

```text
第一次：你详细解释怎么做
第二次：skill 记住关键规则
第三次：你只说阶段和目标
第 N 次：你一句话触发完整 workflow
```

能力增长来自三个复利：

1. **流程复利**：每次任务都更清楚先做什么、后做什么。
2. **验证复利**：每次踩坑都变成未来的检查项。
3. **表达复利**：你的提示词越来越短，但背后的 skill 越来越强。

最终效果不是“AI 替你乱写”，而是你拥有一套会进化的工程操作系统。

## 9. 当前边界

当前版本能做到：

- 安装 `shuang-evolve` 项目级 skill。
- 自动生成 evolution note。
- 自动判断是否满足长期化标准。
- 自动修改目标 skill 或 references。
- 自动跑结构校验。
- 通过 Skill Studio 演化剧场理解规则进化过程。

当前版本不做：

- 不静默提交和推送。
- 不把所有聊天自动写进 skill。
- 不读取 `.env.local`。
- 不保证每次复盘都必须修改 skill。
- 不替代人的产品判断。

## 10. 推荐节奏

每个任务结束后用 3 分钟做一次小复盘：

```text
这次有没有用户纠正？
有没有返工？
有没有漏验证？
有没有触发边界不清？
有没有值得下次复用的规则？
```

如果有两项以上为“是”，运行 `shuang-evolve`。

每周做一次整理：

```text
用 shuang-evolve 扫描 docs/skill-evolution/inbox，整理本周哪些 note 应该升级，哪些应该关闭。
```
