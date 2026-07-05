# 新手入门：如何了解和使用 shuang-skill

这份文档面向第一次进入本仓库的人。目标不是把所有 skill 都背下来，而是先建立一个清晰模型：这个项目是什么、先看哪里、启动什么、第一句该怎么问、什么时候把经验沉淀回 skill。

## 先用一句话理解

`shuang-skill` 是你的 Vibe Coding 工作台：它把需求分析、技术调研、PRD、架构方案、UI 原型、Spec-Kit 文档、TDD 实施、测试闭环、前后端联调、AI 交接提示词和 skill 复盘进化，整理成一套可以反复使用和升级的 agent workflow。

## 10 分钟入门路线

### 第 1 步：先读 README

先读仓库根目录的 `README.md`，只需要理解四件事：

- `.codex/skills/`：真正给 Codex/Claude 等 agent 使用的 skill 目录。
- `.codex/skill-groups/`：按功能分组的索引，方便人找 skill。
- `Skill-Distiller/`：可视化 Skill Studio，用来生成、管理和演化 skill。
- `docs/`：操作手册，说明新项目怎么接入、不同阶段怎么走、skill 如何升级。

### 第 2 步：看总地图

再读 `docs/vibe-coding-operating-map.md`。

你只需要先记住主线：

```text
想法 -> 调研 -> PRD -> 架构 -> UI/设计 -> Spec-Kit 文档 -> TDD 实施 -> 测试闭环 -> 复盘沉淀 skill
```

新手不要一上来问“哪个 skill 最强”，而是先判断自己现在处在哪个阶段。

### 第 3 步：启动 Skill Studio

在仓库根目录运行：

```bash
./start.sh
```

打开：

- `http://localhost:3270/`：Workbench，日常操作入口。
- `http://localhost:3270/library`：查看本地 Skill 库。
- `http://localhost:3270/evolve/theater`：Skill 演化剧场，用来观察和改进 skill。
- `http://localhost:3270/evolve/<skillId>`：对某个 skill 做定向演化。

Workbench 首页的 `Project Launch Pad` 可以输入目标项目路径和一句话需求，然后复制项目级 `install`、`readiness`、`guard`、`drill`、`system-audit`、`start --request`、`next`、`context --json`、`sync-back` 命令。它不会替你执行命令，适合先把下一步命令生成出来，再回到 terminal 运行。

如果只是学习项目，可以先打开 `/library` 看有哪些 skill，再打开 `/evolve/theater` 理解 skill 怎么迭代。

`/evolve/theater` 里还有 `Context Handoff` 面板。真实项目做完一轮后，可以把项目上下文包、任务信号、review/test evidence 粘进去，生成一段可复制的 `shuang-evolve` 交接提示词。它不会自动改文件，适合新手先学会“带证据复盘”，再决定是否把经验升级进长期 skill。

### 第 3.5 步：做一次环境自检

维护本仓库或已安装业务项目时，先用 Node 脚本确认是否已经能用一句话需求开始：

```bash
node scripts/project-readiness.mjs
node scripts/shuang-skill-manager.mjs guard --json
node scripts/project-doctor.mjs
```

`project-readiness.mjs` 会集中检查 `project-doctor`、`validate-skills` 和短提示词路由烟测，并给出下一条 `start --request` 命令。`guard --json` 是提交前安全预检，和 managed `pre-push` hook 共用入口，但不会自动启用 hook。如果你只是把 skills 安装到业务项目，这一步也适用；业务项目默认不需要 Python。只有遇到旧 `quick_validate.py` 或 `No module named 'yaml'` 时，再读 `docs/dev-environment.md`，用项目 `.venv` 安装 `requirements-dev.txt`，不要改全局 Python。

### 第 4 步：用一条最小流程跑起来

新手第一轮不要追求完整大项目，先用一个小想法跑通：

```text
shuang-brainstorm -> shuang-prd -> shuang-specs -> shuang-tdd -> shuang-router -> shuang-evolve
```

这条路线能覆盖 Vibe Coding 的核心：先想清楚，再写文档，再实现，再验证，再复盘升级。

## 三种使用方式

### 方式 A：只学习这个仓库

适合你刚进来，还没准备接入真实项目。

推荐顺序：

1. 读 `README.md`。
2. 读本文档。
3. 读 `docs/vibe-coding-operating-map.md`。
4. 读 `docs/short-command-routes.md`，理解一句话短命令会进入哪个阶段。
5. 启动 `./start.sh`。
6. 在 Workbench 的 `Project Launch Pad` 生成一次安装或启动命令。
7. 打开 `/library` 看 skill。
8. 打开 `/evolve/theater` 看自动进化入口，并试着用 `Context Handoff` 生成一次复盘提示词。

这时你不需要修改任何项目，也不需要复制 skills。

### 方式 B：把 skills 用到一个新项目

适合你已经有一个新项目目录，想让 Codex 在那个项目里使用这套 workflow。

按 `docs/new-project-quickstart.md` 执行项目本地安装：

```bash
cd /Users/mac/Desktop/shuang-kuai/shuang-skill
node scripts/shuang-skill-manager.mjs install --target /path/to/new-project
```

然后进入新项目根目录，让 agent 生成项目自己的指导文件：

```text
请使用 shuang-claude-md，读取当前项目真实 README/package/specs/docs，生成适合本项目的 AGENTS.md 和 CLAUDE.md。不要照搬 shuang-skill 仓库的项目目标，只保留 Vibe Coding 工作流和本项目真实命令。
```

不要直接把本仓库的 `AGENTS.md` 或 `CLAUDE.md` 复制到新项目，因为每个项目的命令、目录、技术栈和上线方式都不同。

### 方式 C：把它当成日常 agent 工作流

适合你已经在真实项目里开发。

最简单的用法是：每次不知道下一步做什么，就先让 `shuang-flow` 判断阶段。

```text
请使用 shuang-flow 判断当前任务处于 Vibe Coding 哪个阶段，并告诉我下一步应该调用哪个 skill。

当前目标：
<写你的目标>

当前项目路径：
<写项目路径>
```

如果任务结束后发现某个流程可以长期复用，再用 `shuang-evolve` 复盘。

你不需要一开始就写很长的提示词。短命令也可以启动流程，例如：

```text
帮我把这个需求变成能交给 Claude Code 的提示词：<一句话需求>
```

如果你在 `shuang-skill` 源仓库里，手上有目标项目路径和一句需求，直接运行：

```bash
node scripts/shuang-skill-manager.mjs start \
  --target /path/to/new-project \
  --request "<一句话需求>"
```

这条命令会自动安装/更新目标项目、跑 `project-doctor`、生成入口卡，并输出下一轮可复制提示词。

如果目标项目已经安装了脚本，也可以直接在项目根目录运行：

```bash
node scripts/shuang-skill-manager.mjs start --request "<一句话需求>"
```

它会生成 `docs/vibe-requests/*.md` 入口卡，并马上输出可以复制给 Agent 的提示词。只想跳过安装更新时，再用底层命令 `node scripts/vibe-request-start.mjs --request "<一句话需求>"`。如果项目已安装 `scripts/project-context-pack.mjs`，输出的提示词会自动带上项目名、技术信号和建议阅读顺序，不需要你手动描述 README、package 或 specs。`shuang-flow` 负责判断阶段，标准路线见 `docs/short-command-routes.md`；`shuang-prompt` 会把短命令整理成意图卡、必读文件、约束、停止规则和验证要求；只有影响方向、安全、架构、外部依赖或验收的问题才会追问。

如果你或另一个 AI 手动改过入口卡，重新交接前运行 `node scripts/shuang-skill-manager.mjs next --json`；只想复制下一轮提示词时运行 `node scripts/shuang-skill-manager.mjs next --raw`。需要排查底层时，再分别运行 `request check`、`request status`、`request prompt --raw`。

## 第一批建议使用的提示词

### 1. 我只有一个想法

```text
请使用 shuang-flow 判断当前阶段，然后用 shuang-brainstorm 帮我把这个想法收敛成 MVP。

我的想法：
<写你的想法>

要求：
- 先问关键问题，不要直接写代码。
- 输出目标用户、痛点、MVP、非目标、验收标准。
- 如果信息足够，给 2-3 个实现路线和推荐方案。
```

### 2. 我要开始一个新项目

```text
请使用 shuang-flow 和 shuang-claude-md，帮我为当前新项目建立 Vibe Coding 起步结构。

要求：
- 先读取当前项目 README、package.json、docs、specs。
- 生成适合本项目的 AGENTS.md 和 CLAUDE.md。
- 不要照搬 shuang-skill 的项目目标。
- 告诉我下一步应该先做 brainstorm、research、PRD 还是直接 feature spec。
```

### 3. 我想写正式 PRD

```text
请使用 shuang-prd，把下面的想法整理成 specs/prd.md。

要求：
- 中文为主，技术名词保留英文。
- 区分 Must-have / Should-have / Could-have。
- 每条需求都要有可验收标准。
- 不写代码。

产品想法：
<粘贴想法或脑暴结论>
```

### 4. 我要把 PRD 拆成可开发任务

```text
请使用 shuang-specs，读取 specs/prd.md，只拆 Must-have。

要求：
- 先输出 feature 拆分表和推荐顺序，等我确认。
- 每个 feature 生成 spec.md、plan.md、tasks.md。
- tasks.md 要适合 TDD，不要过大。
```

### 5. 我要实现某个 feature

```text
请使用 shuang-tdd，实现 specs/00X-xxx 这个 feature。

要求：
- 先读取 AGENTS.md、constitution、spec.md、plan.md、tasks.md。
- 不重新规划需求。
- 按 tasks.md 逐项 TDD：Red -> Green -> Refactor。
- 完成后运行验证，并给出真实命令结果。
```

### 6. 我要把这次经验升级成 skill

```text
请使用 shuang-evolve 复盘这次任务，把值得长期保留的经验沉淀到我的 skills。

输入：
- 本轮任务目标：<填写>
- 用户纠正/偏好：<填写>
- 卡点和返工原因：<填写>
- 验证命令和结果：<填写>
- 可能需要改进的 skill：<填写>

要求：
- 先写 docs/skill-evolution/inbox/YYYY-MM-DD-<topic>.md。
- 不要直接改 SKILL.md。
- 判断是否满足长期化标准。
- 如果满足，再给出候选 skill diff 和验证方式。
```

### 7. 我只有一句很短的需求

脚本方式：

```bash
node scripts/shuang-skill-manager.mjs start --request "<一句话需求>"
```

对话方式：

```text
请使用 shuang-flow 和 shuang-prompt，把这句话变成可以交给另一个 AI 执行的提示词：

<一句话需求>

要求：
- 先判断当前阶段。
- 保留我的原话，不要替我扩展范围。
- 自动补必读文件、硬约束、停止规则和验证要求。
- 只问会阻塞方向、安全、架构、外部依赖或验收的问题。
```

## 常见误区

| 误区 | 正确做法 |
|---|---|
| 一进项目就让 AI 写代码 | 先用 `shuang-flow` 判断阶段 |
| 所有 skill 都想学完再开始 | 先跑通一条最小路线 |
| 一句话需求不知道该触发哪个 skill | 先查 `docs/short-command-routes.md`，或让 `shuang-flow` 判断 |
| 直接复制本仓库 `AGENTS.md` 到新项目 | 用 `shuang-claude-md` 生成新项目自己的指导文件 |
| 把一次踩坑直接写进 `SKILL.md` | 先写 evolution note，再判断是否长期化 |
| 手测通过就认为完成 | 用 `shuang-router` 判断还缺后端、前端、接缝还是完整链路测试 |
| 只写提示词，不给路径和验证要求 | 用 `shuang-prompt` 或 `enhance-prompt` 补完整上下文 |

## 新手最应该记住的 6 个 skill

| skill | 什么时候用 |
|---|---|
| `shuang-flow` | 不知道下一步该干嘛 |
| `shuang-brainstorm` | 想法还不清晰 |
| `shuang-prd` | 需要正式产品需求 |
| `shuang-specs` | 要把 PRD 拆成 feature 文档 |
| `shuang-tdd` | 要按文档实现 feature |
| `shuang-evolve` | 任务结束后沉淀和升级 workflow |

其他 skill 先不用硬记。等你遇到 UI、API、测试、提示词交接、架构选型等具体场景，再从 `docs/vibe-coding-operating-map.md` 和 `.codex/skill-groups/README.md` 里查。

## 如何判断自己真的会用了

你可以用这 5 个结果检查：

1. 能说清 `.codex/skills/`、`Skill-Distiller/`、`docs/` 分别负责什么。
2. 能用 `./start.sh` 打开 Skill Studio。
3. 能用 `shuang-flow` 判断一个任务处在哪个阶段。
4. 能在新项目里安装 skills，并生成项目自己的 `AGENTS.md` / `CLAUDE.md`。
5. 能在任务结束后写一份 evolution note，而不是直接把临时经验塞进长期 skill。

如果这 5 件事都能做到，就已经可以开始用这套系统做真实项目了。

## 学习资料怎么用

如果你有课程、流程图、源码案例，先不要直接复制进 `SKILL.md`。正确入口是：

```text
docs/skill-evolution/course-source-ingestion.md
```

本机私有路径放在 `.shuang-skill/course-sources.local.json`，再运行：

```bash
node scripts/course-source-inventory.mjs
```

需要本机私有摘要时再运行：

```bash
node scripts/course-local-extract.mjs --sources "<source-id>"
```

如果已经有本机摘要，可以批量生成缺失主题 note：

```bash
node scripts/course-extract-to-notes.mjs --dry-run
node scripts/course-extract-to-notes.mjs
```

之后用 `shuang-evolve` 把资料提炼成 evolution note。只有能长期复用的原创规则才升级到 skill。
