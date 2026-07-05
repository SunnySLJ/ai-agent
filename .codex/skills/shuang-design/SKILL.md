---
name: shuang-design
description: "中文主导的 PRD 到 UI 原型与设计系统 Skill。用于基于 PRD 生成 Web 网站 UI 页面规范、DESIGN.md、design tokens、暗色模式、组件规范，以及把 Stitch/DESIGN 约束追加到 .specify/memory/constitution.md；当用户要求“基于 PRD 生成 UI 原型”、“生成 DESIGN.md”、“配置前端设计系统 constitution”、“只覆盖 Must-have”时使用。English keywords: UI prototype, DESIGN.md, design tokens, frontend constitution, Stitch."
---

# PRD To Design System

用这个 Skill 把 PRD 转成可执行的前端设计系统和页面规范。严格按 PRD 做，只覆盖 Must-have，不补营销页、不补账号系统、不加 PRD 外功能。

## 两种模式

1. **PRD -> Web UI + DESIGN.md**
   - 读取完整 PRD。
   - 只覆盖 Must-have。
   - 生成页面路由、页面 Section、核心组件、状态、响应式规则和 `DESIGN.md`。
   - 完整要求见 [references/ui-prototype-design.md](references/ui-prototype-design.md)。

2. **DESIGN.md / Stitch -> constitution 前端设计系统**
   - 读取 `DESIGN.md`、`specs/prd.md`、`design-reference/stitch-export/` 下 2-3 个代表页面。
   - 更新 `.specify/memory/constitution.md` 的“前端设计系统”章节。
   - 只写 constitution 级原则，不复制 hex、token 名、具体组件名或字体名。
   - 完整要求见 [references/frontend-constitution.md](references/frontend-constitution.md)。

## 设计约束

- 排除 `specify`、`clarify`、`plan`、`tasks` 等规格流程请求，除非用户明确要求 UI 原型、`DESIGN.md` 或前端设计系统 constitution。
- 产品第一屏必须是可操作工作台，不做 marketing landing page。
- 视觉气质要服务目标产品，不做浮夸 hero、装饰性渐变或漂浮卡片。
- 所有颜色、字体、字号、间距、圆角、阴影、状态色都必须通过 design tokens 定义。
- 每个页面必须列出路由、对应 Must-have、Section、主状态、错误状态、空状态、平板适配规则。
- 有歧义就写入“需澄清问题”，不要替用户做产品决策。
- 完成文档或规范产出后停止，等待用户确认；不编写业务实现代码或创建实现文件。

## 输出前自检

- 是否只覆盖 Must-have。
- 是否每页都有明确路由。
- 是否每个 Section 可识别。
- 是否所有视觉属性来自 tokens。
- 是否支持 PRD/DESIGN 要求的暗色/亮色模式。
- 是否没有添加 PRD 外功能。
