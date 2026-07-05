# PRD 到 Web UI 与 DESIGN.md

用于基于 PRD 生成 Web UI 页面规范和 `DESIGN.md`。

## 角色

作为资深产品设计师 + 前端架构师。严格按 PRD 执行，不扩展 PRD 未要求的功能。

## 技术与 UI 基底

- React + Next.js 风格信息架构。
- shadcn/ui + Tailwind CSS。
- 桌面优先：主断点 >= 1280px。
- 平板兼容：>= 768px。
- 必须支持 PRD 指定的暗色/亮色模式；未明确时列入澄清问题。
- 所有颜色、字体、字号、间距、圆角、阴影、状态色都通过 design tokens 定义。

## 不做范围

不要添加 PRD 外的营销页、模板市场、团队协作、账号系统、平台发布、数字人、文生视频等功能。

## UI 页面输出规则

只覆盖 PRD 中 Must-have 功能：

- 每个页面必须有路由路径。
- 每个页面必须列出对应 Must-have 来源。
- 每个页面拆成可识别 Section。
- 每个 Section 说明用途、核心组件、主要状态。
- 文案像真实产品，不写“这里展示 XXX”。

## DESIGN.md 结构

生成的 `DESIGN.md` 必须包含：

```md
# DESIGN.md

## 需澄清问题

## 设计原则

## 路由与页面清单

## 用户流程

## 信息架构

## Design Tokens

## 暗色模式

## 组件规范

## 页面规范

## 响应式规则

## 可访问性规则

## 不做范围

## 最终校验清单

## 输入 PRD
```

`Design Tokens` 至少覆盖：

- color
- typography
- spacing
- radius
- shadow
- z-index
- motion
- layout
- breakpoint
- semantic status colors

## 页面规范最小字段

每个页面包含：

- 路由。
- 对应 Must-have。
- Section 列表。
- 主状态。
- 错误状态。
- 空状态。
- 平板适配规则。

## 视觉设计要求

- 产品气质由 PRD 决定；典型工具类产品应安静、高效、可信赖。
- 首屏就是可操作工作台，不做营销 landing page。
- 避免大面积装饰性渐变、漂浮卡片、夸张 hero。
- 信息密度适中，适合长时间工作。
- 核心工作界面优先保证扫描、比较、调整、导出效率。
- 按钮、输入框、卡片、时间线、日志等组件要有 hover / active / disabled / loading / error 状态。
- 图标按钮优先使用 lucide 图标。

## 最终校验清单

- 是否只覆盖 Must-have。
- 是否每页有路由。
- 是否每个 Section 可识别。
- 是否所有视觉属性来自 tokens。
- 是否支持暗色模式。
- 是否没有添加 PRD 外功能。
