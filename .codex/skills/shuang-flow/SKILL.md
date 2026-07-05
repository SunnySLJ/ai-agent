---
name: shuang-flow
description: "中文主导的文档驱动代码总调度 Skill。用于把想法推进到调研、PRD、架构基线、UI/DESIGN、Spec-Kit feature 文档、TDD 实施、测试闭环、代码链路文档和 AI 提示词交接；当用户提到“文档驱动代码”、“Vibe Coding 全链路”、“brainstorming 后生成 spec”、“PRD/spec/plan/tasks”、“UI 原型/DESIGN.md”、“测试闭环”、“项目级 skill/MCP 安装”、“代码链路文档”、“复制给 AI 的提示词”时使用。English keywords: document-driven development, PRD, Spec-Kit, DESIGN.md, implementation handoff, prompt handoff."
---

# Document Driven Code

用这个 Skill 把“想法”先沉淀为可执行文档，再进入代码实现。核心原则：先读项目真实文件，再澄清不确定性，再落盘文档，最后才交给实现流程。

整体 skill 系统路由见 [references/skill-system-map.md](references/skill-system-map.md)。当用户的问题跨多个阶段，先读该文件再决定使用哪个兄弟 skill。

## 短提示词展开规则

当用户只说“按我的 Vibe Coding 流程做”“帮我加一个新功能”“用这些 skill 推进”这类短提示词时，不要求用户一次性写清所有细节。先判断当前阶段，然后自动补齐本阶段的四件套：

- 输入：需要读取的真实项目文件、已有文档、用户原话。
- 产物：本阶段应该落下的文档、代码、测试、提示词或复盘 note。
- 停止点：哪些位置必须等用户确认。
- 下一触发：下一步应该交给哪个 skill 或命令。

短命令到阶段的标准路线见 `docs/short-command-routes.md`；安装到业务项目后路径是 `docs/shuang-skill/short-command-routes.md`。如果修改短提示词路线、quickstart 或 `shuang-prompt` 的短命令入口，先跑 `node scripts/short-command-route-check.mjs`，再跑 `node scripts/short-command-route-smoke.mjs` 验证真实短提示词会路由到正确 stage/skill。

只有缺失信息会改变产品方向、架构边界、数据安全、支付/鉴权或发布风险时才问用户。

## 阶段门输出格式

当任务跨阶段，或用户只给短需求时，每到一个阶段先用这个格式收束，不要直接跳到后续阶段：

```md
当前阶段：
输入依据：
本阶段产物：
需要暂停确认：
下一触发：
```

如果“需要暂停确认”不为空，先停下来等用户；如果为空，才进入“下一触发”对应的 skill 或命令。

## 主流程

1. **想法澄清（brainstorming）**
   - 先梳理用户痛点、目标用户、非目标、MVP 边界和验收标准。
   - 能从现有仓库/文档判断的不要反复问；影响产品方向或技术边界的必须问。
   - 11 问框架见 [references/discovery-and-prd.md](references/discovery-and-prd.md)；需要完整脑暴收敛时交给 `$shuang-brainstorm`。

2. **调研（research）**
   - 需要外部信息时，把独立问题拆到 `specs/research/` 下。
   - 可并行的调研要明确 scope、context、constraints、expected output。
   - 双路调研、MCP 安装和 `05-决策汇总.md` 模式见 [references/research-workflows.md](references/research-workflows.md)；新产品立项调研交给 `$shuang-research`。

3. **PRD**
   - 基于 brainstorming 结果和 `specs/research/` 写 `specs/prd.md`。
   - 如果用户要正式 PRD，交给 `$shuang-prd`；没有上游材料时先回到调研或脑暴。

4. **Spec-kit 文档链**
   - 如果用户要求从 PRD 的 Must-have 拆多个 feature，交给 `$shuang-specs`；如果用户显式点名 Spec-Kit 命令，可使用 `speckit-specify`、`speckit-clarify`、`speckit-plan`、`speckit-tasks`。
   - 拆多个 feature 前，先输出拆分列表和推荐顺序，等待用户确认。
   - 如果只是解释 handoff 规则，读 [references/spec-kit-handoff.md](references/spec-kit-handoff.md)。

5. **前端设计系统接入**
   - 如果用户要求基于 PRD 生成 Web UI 原型、`DESIGN.md` 或前端 constitution，交给 `$shuang-design`。
   - 如果用户给截图、Figma、HTML 原型或参考站点，交给 `$shuang-web-design-master`、`$figma-to-nextjs-migration` 或 `$shuang-prototype-to-next`。
   - 如果只是说明局部重跑或 Stitch 引用规则，读 [references/frontend-design-system.md](references/frontend-design-system.md)。

6. **项目级指导文件**
   - 用户要求 `AGENTS.md`、`Agent.md`、`CLAUDE.md` 时，只从真实项目文件抽取规则。
   - 写入后如果项目里有 `scripts/memory-placement-check.mjs`，先跑它，确认没有把任务复盘、用户画像或本机业务路径塞进入口指导文件或通用 skill。
   - Karpathy-inspired 指南、章节框架和来源映射要求见 [references/project-guidance-files.md](references/project-guidance-files.md)；需要生成/刷新 `AGENTS.md` 时交给 `$shuang-claude-md`。

7. **实施交接**
   - 如果用户只要文档，到 `tasks.md` 就停。
   - 如果用户要求实现，交给 `$shuang-tdd`；如果用户显式点名 Spec-Kit 实施，可使用 `speckit-implement`。
   - `shuang-run-feature` 和 `shuang-course-run` 已归档；新实施任务使用 `$shuang-tdd`。
   - 如果需要先做开源项目架构基线决策，交给 `$shuang-arch`。

8. **测试闭环**
   - Feature 完成后，如果用户要补齐测试、发布前风险判断或测试体系化，先交给 `$shuang-router` 判类。
   - 单后端缺口交给 `$shuang-backend`；单前端交给 `$shuang-frontend`；局部接缝交给 `$shuang-slice`；完整链路交给 `$shuang-chain`。
   - 测试方法蓝本统一参考 `$shuang-blueprint`。

9. **代码链路交付**
   - 如果用户要“代码链路”“方法行号”“可跳转文档”“AI 开发过程说明”“这次改动涉及哪些文件和方法”，交给 `$shuang-code-handoff`。
   - 如果用户要“接口联调”“给前端对接”“生成 Apifox”“OpenAPI”，交给 `$shuang-api-handoff`。
   - 如果同一轮既要整体代码链路又要接口联调包，先用 `$shuang-code-handoff` 生成整体代码图，再追加 `$shuang-api-handoff`。

10. **AI 提示词交接**
   - 如果用户要“复制给 AI 的提示词”、让另一个 AI 理解当前项目/阶段/需求，交给 `$shuang-prompt`。
   - `$shuang-prompt` 只生成提示词，不执行提示词里的任务。

11. **Skill 复盘进化**
   - 如果用户要求“把这次经验沉淀成 skill”、“升级我的工作流”、“自动进化我的 skills”、“让我逐步形成自己的 Vibe Coding 方法”，交给 `$shuang-evolve`。
   - 如果用户提供课程资料、学习文档、流程图或源码案例来完善 skill，也交给 `$shuang-evolve`；先走本地资料索引和 evolution note，不直接复制原文进 `SKILL.md`。
   - 先写 `docs/skill-evolution/inbox/YYYY-MM-DD-<topic>.md`，记录任务上下文、用户偏好、失败点、可复用规则、目标 skill 和验证方式。
   - 只有通过长期化标准后，才更新 `.codex/skills/<skill>/SKILL.md` 或其 `references/`。

## 项目级安装规则

当用户要求安装老师给的 skill 或 MCP 工具：

- 默认安装到当前项目，不装全局，除非用户明确要求。
- 先读源目录 README，再改配置。
- 用户要求改名时才改名，例如 `muyu-search-mcp` -> `shuang-search-mcp`。
- 安装后必须验证，并告诉用户如何触发。

## 相关外部流程 / Skill 名称

这些名称用于识别用户在外部工具或历史流程里的意图：`brainstorming`、`writing-plans`、`executing-plans`、`subagent-driven-development`、`verification-before-completion`、`test-driven-development`、`systematic-debugging`、`requesting-code-review`、`using-git-worktrees`、`finishing-a-development-branch`、`writing-skills`、`dispatching-parallel-agents`、`$shuang-brainstorm`、`$shuang-research`、`$shuang-prd`、`$shuang-arch`、`$shuang-specs`、`$shuang-design`、`$shuang-router`、`$shuang-tdd`、`$shuang-code-handoff`、`$shuang-prompt`、`$shuang-evolve`、`Skill Studio`。

如果当前环境启用了 Superpowers，可在不违反用户和项目指令的前提下调用相关技能；未启用时，用内置工具和项目文档规则执行相同纪律。
