# 前端设计系统

当 feature 涉及 React 页面、组件、表单、表格或视觉原型时读取本文件。

## Constitution 更新方式

当项目有 `DESIGN.md` 和 `design-reference/stitch-export/`：

1. 读取：
   - `DESIGN.md`
   - `specs/prd.md`
   - `design-reference/stitch-export/` 下 2-3 个代表页面
2. 抽取抽象原则，写入 `.specify/memory/constitution.md`。
3. 每条原则都引用来源文件。

应该写：

- `DESIGN.md` 是视觉规范真理来源。
- 什么时候读取 `design-reference/stitch-export/<page>/`。
- PRD 里明确的目标市场/用户群约束。
- `DESIGN.md` 里体现的组件库基底。
- 信息密度、设计哲学、多语言、暗色/亮色策略。
- 未明确的信息写到 Open Questions。

不要写：

- hex 值。
- token 名。
- 具体组件名。
- 字体名。
- PRD/DESIGN 没说的自作主张。

## 前端 Feature 局部重跑

先扫描 `specs/`，输出：

```md
| feature 目录 | 是否含前端 | 需要重跑哪步 | 对应 design-reference 哪个页面 |
```

等用户确认后，再逐个 feature 局部重跑。

对每个确认的 feature：

- `spec.md` 和 clarify 结果不动。
- 只更新 `plan.md` 前端章节；保留后端/集成内容。
- 重新评估 `tasks.md`。
- 前端任务标 `[FE]`，后端任务标 `[BE]`，集成任务标 `[INT]`。
- `[FE]` 任务必须标注 DESIGN 章节、参考 HTML 路径、shadcn/stitch 组件依据。

## Stitch Skills

如果已安装 `stitch-skills`，前端实现优先把 `design-reference/stitch-export/<page>/code.html` 转成 React 组件，而不是从零写。
