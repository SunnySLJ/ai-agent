# 短提示词路线表

这份表把新手常说的一句话，映射到当前 Vibe Coding 阶段、入口 skill、下一触发和停止点。目标是让用户不用一次性写长提示词；agent 先读项目事实，再按阶段门补齐输入、产物、停止点和下一触发。

维护规则：

- 表格里的 `阶段ID` 是脚本校验字段，不要随意改名。
- `短提示词` 是用户可能直接说的话，不是完整模板。
- `入口 skill` 只写当前项目真实存在的 skill。
- `停止点` 必须说明什么时候不能继续自动推进。
- 改完先运行 `node scripts/short-command-route-check.mjs` 做静态一致性校验，再运行 `node scripts/short-command-route-smoke.mjs` 用真实短提示词样例做动态路由烟测。

## 核心路线

| 阶段ID | 短提示词 | 入口 skill | 下一触发 | 停止点 |
|---|---|---|---|---|
| intake | 帮我判断现在该走哪一步 | `shuang-flow` | `shuang-brainstorm` / `shuang-prd` / `shuang-tdd` | 目标跨阶段、当前目录不明或风险边界不清时停 |
| brainstorm | 我只有一个想法，先帮我收敛 | `shuang-brainstorm` | `shuang-prd` 或 `shuang-research` | 产品方向、目标用户、MVP 或非目标未确认时停 |
| research | 这个方案值不值得做，帮我调研 | `shuang-research` | `shuang-prd` / `shuang-arch` | 证据不足、候选路线分歧或外部事实需要确认时停 |
| prd | 帮我写正式 PRD | `shuang-prd` | `shuang-specs` | Must-have、验收标准或不做范围未确认时停 |
| arch | 帮我比较技术方案并定架构 | `shuang-arch` | `shuang-design` / `shuang-specs` | 架构基线、复用边界、数据安全或成本风险未确认时停 |
| design | 按 PRD 做页面和设计规范 | `shuang-design` | `shuang-specs` 或 `shuang-next` | 视觉方向、交互流程、设计系统约束未确认时停 |
| specs | 把 PRD 拆成可开发 feature | `shuang-specs` | `shuang-tdd` | feature 顺序、tasks 粒度或 spec/plan/tasks 一致性未通过时停 |
| implement | 帮我实现这个 feature | `shuang-tdd` | `shuang-router` | feature 文档缺失、测试失败、review 未过或范围漂移时停 |
| test | 功能写完了，帮我补测试闭环 | `shuang-router` | `shuang-backend` / `shuang-frontend` / `shuang-slice` / `shuang-chain` | 发布风险、真实链路、鉴权/支付/数据安全风险未收敛时停 |
| api-handoff | 这个接口要给前端联调 | `shuang-api-handoff` | `shuang-slice` | 真实代码行号、请求/响应示例、OpenAPI/Apifox 或前端消费假设缺失时停 |
| code-handoff | 这次改动的代码链路在哪 | `shuang-code-handoff` | `shuang-prompt` / `shuang-evolve` | 文件、方法行号、调用顺序、数据流或验证证据缺失时停 |
| prompt | 帮我把一句话需求变成给 AI 的提示词 | `shuang-prompt` | 目标 AI 执行或回到 `shuang-flow` | 阶段、必读文件、硬约束、停止规则或目标 AI 不可判断时停 |
| release-readiness | 上线前帮我检查风险 | `shuang-router` / `shuang-prompt` | 发布或回到补测/交接 | 发布门、回滚方案、剩余风险或验证证据未确认时停 |
| evolve | 把这次经验升级进 skill | `shuang-evolve` | `node scripts/evolution-promotion-package.mjs --note <note>` | 长期化标准、验证命令或目标 skill 不明确时停 |
| course | 用课程资料完善我的 skills | `shuang-evolve` | `node scripts/course-source-health.mjs` / `node scripts/course-source-inventory.mjs` | 课程原文、私有路径、截图、PDF 正文或敏感信息可能进入公开仓库时停 |
| install-sync | 安装到项目并确认能用 | `shuang-evolve` | `node scripts/project-readiness.mjs` / `node scripts/project-audit.mjs --target <project> --with-readiness --with-request-smoke --with-route-smoke` | 目标项目路径、安装源、回流方向或 hook 激活策略不明确时停 |

## 使用方式

脚本方式：

```bash
node scripts/shuang-skill-manager.mjs start --request "<一句话短命令>"
```

这会在已安装项目里更新 managed skills 和脚本，运行 `project-doctor`，生成 `docs/vibe-requests/*.md` 入口卡，并输出下一轮可复制提示词。只想跳过安装更新时，再用底层命令 `node scripts/vibe-request-start.mjs --request "<一句话短命令>"`。

入口卡已经存在或被人工修改后，日常用 `node scripts/shuang-skill-manager.mjs next --json` 重新校验、看队列、运行 guard 并抽出可复制提示词；只想复制提示词时用 `node scripts/shuang-skill-manager.mjs next --raw`。需要拆开排查时，再运行 `request check`、`request status`、`request prompt --raw`。

路线规则改完后，用下面两个命令确认：

```bash
node scripts/short-command-route-check.mjs
node scripts/short-command-route-smoke.mjs
```

当用户只给一句短命令时：

1. 先用 `shuang-flow` 判断阶段，不要求用户补完整长提示词。
2. 对照本表找到入口 skill、下一触发和停止点。
3. 输出阶段门四件套：输入、产物、停止点、下一触发。
4. 只有停止点触发时才追问；否则继续调用下一阶段 skill。
5. 如果用户要交给另一个 AI，使用 `shuang-prompt` 生成短命令意图卡和可复制提示词。

## 课程来源沉淀

这份路线表吸收的是课程资料中的原创方法论总结：Skill 触发、progressive loading、Harness 阶段门、文件化记忆和复盘升级。公开仓库只保存路线规则，不保存课程原文、PDF 正文、截图、zip 或私有路径。
