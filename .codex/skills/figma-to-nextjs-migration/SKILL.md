---
name: figma-to-nextjs-migration
description: >
  把 Figma Make / v0.dev / Bolt / Lovable 等 UI 原型生成器产出的 Vite + React Router 项目，
  迁移到 shuang-open-design 中的 shuang-video 或用户明确指定的 Next.js App Router 应用。覆盖
  React Router 到 Next.js App Router、样式合并、next/font、客户端组件边界、Hydration mismatch、
  shadcn/ui 复用和路径别名统一。触发场景包括 Figma Make、v0.dev、Bolt、Lovable、Vite、React Router、
  Next.js、App Router、迁移、搬家、migrate、port、部署、流式 API、服务端组件、Edge Runtime。
  不处理 Next.js 到 Vite/Remix/Astro 等反向迁移，也不把 shuang-open-design 根目录假设为 Next.js 项目。
---

# figma-to-nextjs-migration — UI 原型到 shuang-video/Next.js 的工程化迁移

## 当前项目约束

- `shuang-open-design` 根目录不是单一 Next.js 应用，不要把 API route、`app/`、`src/`、`package.json` 默认写到根目录。
- 默认候选 Next.js 应用是 `shuang-video`，但实施前必须确认用户目标路径；用户指定其他 Next.js app 时以用户指定为准。
- 设计说明、迁移记录、阶段性汇报默认使用中文。
- 涉及视觉风格判断时，优先参考 `/Users/mac/Desktop/vibe-coding/shuang-figma`，不要照搬 AgentHub 的产品语境。
- 如果任务涉及 Open Design artifact，应先通过 Open Design/MCP 工具读取当前设计，不凭空推断页面结构。

## 触发条件

加载这个 skill 的典型场景：

- 用户提到 Figma Make / v0.dev / Bolt / Lovable 等 UI 原型生成器，并希望把产物用到当前项目。
- 用户手里有 Vite + React Router 项目，想迁移到 Next.js 15/16 App Router。
- 用户说“搬家”“迁移”“换成”“migrate”“port”“改造”。
- 用户说 Vite 原型不适合部署、流式 API、服务端组件、Edge Runtime 或正式工程化。
- 用户想把 React Router 路由迁移到 App Router 文件路由。

不触发：

- Next.js 到 Remix / Vite / Astro 等反向迁移。
- Pages Router 到 App Router 的纯 Next.js 内部迁移。
- 纯 Tailwind 升级、纯 shadcn 组件替换等局部变更。

## 开工前置检查

在写文件或运行脚本前，必须先确认：

1. 源原型路径是什么；不要猜。
2. 目标 Next.js app 路径是什么；可建议 `shuang-video`，但必须确认。
3. 目标路径下是否存在 `package.json`，且依赖中包含 `next`。
4. 目标项目使用 `app/` 还是 `src/app/`；所有示例路径要随之调整。
5. 是否需要保留现有 shuang-video 代码；如需覆盖或删除文件，必须先获得用户明确确认。

如果目标路径不是 Next.js App Router 项目，停止迁移并说明原因。

## 核心心智模型

Figma Make / v0.dev / Bolt / Lovable 更适合产出视觉原型，不等于生产脚手架。迁移不是返工，而是把“设计验证产物”接力到“可维护工程项目”：路由、样式、字体、状态、服务端能力、构建和部署都需要按目标 Next.js app 的约束重新落位。

详见 `@references/migration-steps.md` 的迁移步骤说明。

## 工作流

### Step 1：备份与目标 app 确认

- 源项目备份可使用 `scripts/backup.sh <源项目路径>`。
- 如需新建 Next.js app，可参考 `scripts/create-next-scaffold.sh <新项目名>`；如果目标是现有 `shuang-video`，不要新建脚手架，先读现有结构。
- 不要在 Vite 项目里硬装 Next.js 依赖。

### Step 2：样式层迁移

- 用 `next/font/google` 替换 Google Fonts `@import`，可参考 `templates/next-fonts-template.ts`。
- 合并全局样式时，以目标 app 当前 `globals.css` 为准，参考 `templates/globals-css-template.css`，不要盲目覆盖。
- shuang-open-design 视觉方向优先对齐 `/Users/mac/Desktop/vibe-coding/shuang-figma`。

### Step 3：组件库迁移

- 可复制源原型中的 `components/ui/`、`lib/utils.ts`、`ImageWithFallback` 等可复用组件。
- 复制前检查目标 app 是否已经有同名组件；遇到冲突先汇报差异，不要直接覆盖。
- import 路径统一到目标 app 已采用的别名；Next.js 常见默认是 `@/`。

### Step 4：布局层重构

- React Router 的 `Root`、`Outlet`、Header、Footer 结构迁移到目标 app 的 `layout.tsx`。
- 如果 Header 使用 `usePathname()` 或交互状态，相关组件必须标记为 client component。
- 可参考 `templates/next-layout-template.tsx`，但必须按目标 app 的目录和设计系统调整。

### Step 5：页面层迁移

按 React Router 源页面与 Next.js 文件路由关系逐页迁移。常见映射见 `@references/rr-to-next-mapping.md`。

迁移时不要照搬 AgentHub 的页面名；以当前源原型和目标 `shuang-video` 的实际页面需求为准。

### Step 6：批量替换 Router API 与客户端组件边界

- `react-router` 的 `Link`、`useParams`、`useNavigate` 等要替换为 `next/link` 和 `next/navigation` 对应 API。
- 哪些文件需要 client component，按 `@references/use-client-rules.md` 判断。
- 不要把所有文件都标成 client component；只给确实使用 hooks、事件、浏览器 API 或 Next navigation hooks 的组件加。

### Step 7：Hydration 与验证

- mock data 中的 `Math.random()`、`Date.now()`、不稳定时间格式可能导致 Hydration mismatch。
- 修复模式见 `@references/hydration-fixes.md`。
- 验证命令以目标 app 的 `package.json` 为准，常见为 `pnpm dev`、`pnpm build`；不要在 shuang-open-design 根目录盲跑。
- `scripts/verify.sh` 可作为参考脚本，使用前先确认它的路由清单是否适合当前 app。

## 决策规则

- 遇到不认识的报错，先查 `@references/common-errors.md`。
- 迁移只做工程化搬家，不顺手改业务逻辑、中文文案或视觉方向，除非用户明确要求。
- 对 Open Design 原型相关任务，先读取当前 artifact，再决定迁移范围。
- 对 `shuang-video` 的现有文件，默认保留；任何覆盖、删除、重命名都先说明影响。

## 验收标准

按目标 app 实际脚本检查：

1. 依赖安装完成且 lockfile 与包管理器一致。
2. dev server 能启动。
3. build/typecheck 通过。
4. 关键页面能打开，视觉与源原型和 `/Users/mac/Desktop/vibe-coding/shuang-figma` 方向一致。
5. 浏览器控制台无 Hydration mismatch 警告。
6. 导航、交互、深色模式等客户端行为正常。

## 相关物料

- `@references/migration-steps.md` — 迁移流程详解。
- `@references/rr-to-next-mapping.md` — React Router 与 Next.js API 对照。
- `@references/use-client-rules.md` — client component 判定规则。
- `@references/hydration-fixes.md` — Hydration mismatch 修复模式。
- `@references/common-errors.md` — 常见报错与解法。
- `templates/` — 可参考的 Next.js 模板，使用前必须按目标 app 调整。
- `scripts/` — 可参考的辅助脚本，运行前必须确认路径和路由清单。
- `examples/agenthub-migration-log.md` — 历史课程案例，只作为参考，不代表当前项目结构。
