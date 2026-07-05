---
name: shuang-evolve
description: "中文：用于从真实任务经验或学习资料中升级项目 skills；当用户说“升级 skill”“复盘沉淀”“自动进化我的 workflow”“把这次经验写进 skill”“用课程/文档完善 skill”“让我成为 Vibe Coding 高手”时使用。English keywords: skill evolution, auto-upgrade skills, retrospective, workflow improvement."
---

# Shuang Skill Evolution

用这个 skill 把真实任务里的经验转成可审查、可验证、可回滚的 skill 改进。目标是让用户用越来越简单的提示词，触发越来越成熟的 Vibe Coding 工作流。

详细原理见项目文档：`docs/skill-evolution/auto-upgrade-system.md`。需要执行升级时，按下面流程做。

## 触发场景

- 用户要求升级、进化、优化、合并、沉淀某个 skill。
- 用户说这次经验以后也要记住、写进 workflow、让项目自动改进。
- 用户提供课程资料、学习文档、流程图、源码案例，希望提炼成长期 skill 能力。
- 任务中出现明确纠正、反复卡点、验证遗漏、范围漂移、触发边界不清。
- 需要把一次任务复盘变成 `docs/skill-evolution/inbox/*.md`、候选 diff 或真实 `SKILL.md` 修改。

不用于一次性业务事实、临时路径、未经验证的猜测，或只属于当前对话的偏好。

## 自动升级闭环

1. **收集信号**
   - 读取本轮任务的用户要求、代码 diff、验证命令、失败点、用户纠正。
   - 如果是历史复盘，先读用户指定的文档、issue、PR、日志或聊天摘要。
   - 不读取或复述 `.env.local`、真实 key、个人隐私。

2. **写 evolution note**
   - 优先用脚本生成模板：
     ```bash
     node scripts/create-evolution-note.mjs --topic "<topic>" --skill "<target-skill>" --task "<task-summary>"
     ```
   - 文件位置固定为 `docs/skill-evolution/inbox/YYYY-MM-DD-<topic>.md`。
   - note 必须记录：Context、Signal、Reusable Rule、Target、Proposed Diff、Validation。

3. **检查 inbox 队列**
   - 升级前先看当前候选和草稿缺口：
     ```bash
     node scripts/evolution-inbox-status.mjs --limit 8
     node scripts/evolution-review.mjs
     ```
   - 如果输出里有 `draft`，先补 Context/Signal/Reusable Rule/Validation 等缺项。
   - 如果有多个 `ready`，用 `evolution-review` 的 `promoteCandidates` 选择最能减少用户提示词长度、补验证门或修触发边界的 note。
   - 如果 `closeCandidates` 有内容，优先把一次性业务事实或不长期化的 note 标为 `parked`，不要升级进长期 skill。
   - 如果 note 已落地，补 `## Lifecycle` 并标为 `promoted`；如果证据不足但值得保留，标为 `parked`。

4. **生成升级候选包**
   - 对选中的 `ready` note 先跑：
     ```bash
     node scripts/evolution-promotion-package.mjs --note <ready-note>
     ```
   - 只有 recommendation 是 `promote` 或补齐验证计划后的 `promote-after-validation-plan`，才进入 skill diff。
   - 如果输出 `complete-note`，先补 note 缺项；如果输出 `keep-parked` 或 `already-promoted`，不要重复改 skill。
   - 按 package 里的 `validationCommands` 准备验证清单，课程类 note 必须额外包含 course source 检查。

### 学习资料接入

当输入是课程目录、PDF、Excalidraw、Notebook、源码案例或老师资料时：

1. 先读 `docs/skill-evolution/course-source-ingestion.md`；需要更细的主题提炼规则时读 [references/course-distillation.md](references/course-distillation.md)。
2. 私有路径放进 `.shuang-skill/course-sources.local.json`，不要提交原始资料、课件正文、截图、zip、模型文件或大段摘录。
3. 先跑 `node scripts/course-source-health.mjs`，确认 registry 无重复 id、路径存在、`.shuang-skill/` 已忽略。
4. 用 `node scripts/course-source-inventory.mjs` 做只读盘点；需要给下游自动化读取时加 `--json`。它只保存类型、标题和短样例，不抽取 PDF 正文。
5. 需要私有摘要时，用 `node scripts/course-local-extract.mjs` 输出到 `.shuang-skill/extracts.local/`；该目录不提交。
6. 私有摘要也必须脱敏；key、token、password、Authorization、`sk-*` 等敏感片段只能以 `<redacted>` 形式出现。
7. 如果 extract 里已有 topicCandidates，用 `node scripts/course-extract-to-notes.mjs` 批量生成缺失主题 note。
8. 每次只选一个主题写 evolution note，例如 skill 触发、阶段门、测试门、记忆协议或提示词缩短；可用 `node scripts/create-course-evolution-note.mjs` 生成标准 note。
9. 只把原创总结升级进 skill：触发条件、步骤、检查清单、反例、验证命令、模板。课程细节和长案例放 `docs/` 或 `references/`，保持 `SKILL.md` 短。

### 长期化前降噪

从课程或资料升级到 skill 前，先把候选内容压缩成一条 future-facing rule：

- 删除课程原文、老师案例、截图文字、私有路径和一次性业务事实。
- 删除当前项目不可用的工具名、内部实现细节和未验证宣传结论。
- 保留能改变未来 agent 行为的内容：触发条件、阶段门、scope guard、验证门或输出模板。
- 如果规则只是在解释背景，放 `references/` 或 `docs/`；只有会改变执行行为时才改 `SKILL.md`。
- 如果一句话说不清“以后遇到什么情况要怎么做”，只保留 inbox note，不升级 skill。

5. **判断是否可升级**
   - 至少满足两条才改 skill：
     - 未来同类任务很可能再次出现。
     - 有清晰触发句式。
     - 能转成步骤、检查表或验证命令。
     - 能减少返工、误触发或范围漂移。
     - 用户明确说这是长期偏好。
   - 不满足时只保留 inbox note，不修改 `.codex/skills/`。

6. **选择目标**
   - 已有 skill 可承载：更新 `.codex/skills/<skill>/SKILL.md` 或 `references/`。
   - 多个 skill 重复：更新 canonical skill，并在 `docs/skill-consolidation-plan.md` 说明。
   - 新能力独立且可复用：新增 `.codex/skills/<new-skill>/SKILL.md`，并更新 `.codex/skill-groups/`。

7. **生成最小 diff**
   - 只改与复盘信号直接相关的规则。
   - 大段原理、示例、路线图放进 `references/` 或 `docs/`，保持 `SKILL.md` 可触发、可执行、不过长。
   - 保留中文为主，命令、路径、API、框架名用英文。

8. **验证**
   - 升级某个 ready note 时，先保留对应候选包证据：
     ```bash
     node scripts/evolution-promotion-package.mjs --note <ready-note>
     ```
   - 必跑：
     ```bash
     node scripts/agent-workbench-boundary-check.mjs
     node scripts/memory-placement-check.mjs
     node scripts/managed-artifacts-check.mjs
     node scripts/validate-skills.mjs
     node scripts/evolution-inbox-status.mjs --limit 8
     node scripts/evolution-review.mjs --json
     ```
   - 如果更新了课程资料注册表或接入规则，再跑：
     ```bash
     node scripts/course-source-health.mjs
     node scripts/course-source-inventory.mjs --json
     node scripts/course-local-extract.mjs --sources <source-id>
     node scripts/course-extract-to-notes.mjs --dry-run
     ```
   - 如果更新了短提示词路线、quickstart、`shuang-flow` 或 `shuang-prompt` 的短命令入口，再跑：
     ```bash
     node scripts/shuang-skill-manager-request.test.mjs
     node scripts/short-command-route-check.mjs
     node scripts/short-command-route-smoke.mjs
     ```
   - 如果更新了 Vibe Coding 阶段、主线能力、安装范围或课程提炼路线，再跑：
     ```bash
     node scripts/vibe-workflow-coverage-check.mjs
     ```
   - 如果更新了安装脚本、`sync-back`、目标项目回流文档或安装同步规则，再跑：
     ```bash
     node scripts/project-audit.test.mjs
     node scripts/shuang-skill-manager-hooks.test.mjs
     node scripts/sync-back-smoke.mjs
     ```
   - 如果改动已经同步到真实业务项目，再从源仓库审计这些目标项目：
     ```bash
     node scripts/shuang-skill-manager.mjs audit --target <project> --with-readiness --with-start-smoke --with-request-smoke --with-route-smoke
     ```
   - 如果改了 Skill Studio 代码、导航入口或页面路由，再跑：
     ```bash
     node scripts/skill-studio-route-smoke.mjs
     cd Skill-Distiller && OPENROUTER_API_KEY=placeholder pnpm build
     ```
   - 报告验证结果，不用“应该可以”代替证据。

9. **更新 note 生命周期**
   - 升级并验证后，在对应 note 末尾补：
     ```markdown
     ## Lifecycle

     - Status: promoted
     - Promoted by: `<commit-or-change-ref>`
     - Evidence: <验证命令或落地说明>
     ```
   - 暂不升级但以后可能有用时，用 `Status: parked` 并写清等待什么证据。
   - 不要把未验证 note 标成 `promoted`。

## 输出格式

完成后给用户：

- 更新了哪些 skill 或文档。
- 哪条经验被长期化。
- 哪些内容没有升级，原因是什么。
- 验证命令和结果。
- 下次可用的简单提示词。

## 简单触发提示词

用户以后可以直接说：

```text
用 shuang-evolve 复盘这次任务，把值得长期保留的经验升级到我的 skills。
```

```text
把这次踩坑沉淀成 evolution note，满足条件就自动改对应 SKILL.md，并跑校验。
```

```text
检查我的 skills 有没有重复、过时、触发不清的地方，给我一个升级候选清单。
```
