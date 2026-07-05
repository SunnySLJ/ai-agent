---
name: shuang-web-design-master
description: >-
  中文：网页设计大师工作流；用于把参考站点、截图、Figma/HTML 原型转译成高保真网页界面，尤其适合 AI 视频/创作平台的首页、生成页、工作台和 composer 组件复刻。
  English: Web design master workflow for translating reference sites, screenshots, Figma/HTML prototypes into high-fidelity web UI, especially AI video/create-platform home, create workspace, and composer layouts.
---

# shuang-web-design-master · 网页设计大师

## 这个 skill 解决什么

当用户说“照这个网页做”“把这个框平移过来”“参考 Pollo / Figma / 截图重做页面”“为什么不像”时，使用本 skill。
目标不是抽象讨论设计，而是把**参考视觉**拆成可执行的前端改造：布局、层级、间距、圆角、透明度、按钮状态、文案和交互状态。

本项目当前关键参考已采集：

- `figma-design/02-design/mockups/pollo-create-page-captured.html` — 已通过 Chrome 调试端口抓取的 Pollo 创建页 DOM。
- `figma-design/02-design/mockups/pollo-create-page-summary.json` — 已提取的 Pollo 创建页可见文本、控件、部分尺寸与样式摘要。
- 用户截图参考：Pollo 风格首页/登录首页 composer，以及 `/create` 底部 composer 左侧竖栏。

## 什么时候使用

- 用户给截图，让你“做成这样”“直接平移过来”。
- 用户给外部页面 URL，让你抓取页面并复刻布局。
- 当前页面“看起来很奇怪”“不像参考”“首页没有变”。
- AI 视频/图片/数字人/音频创建器、底部 composer、左侧 mode rail、工具 tabs、空状态、登录后首页工作台等视觉改造。

## 先确认目标页面，避免改错

用户说“首页”时必须先区分：

1. 公开首页：`/` 未登录态，组件通常是 `HeroGenerator`。
2. 登录后首页：`/` 已登录态，组件通常是 `LoggedInHome`。
3. 点击“生成”后的页面：`/create`，组件通常是 `CreateWorkspace`。

不要只改公开首页；如果用户截图里有左侧 dashboard sidebar、顶部促销条、额度和升级按钮，通常是**登录后首页或 `/create`**。

## Pollo 创建页设计基线

从 `pollo-create-page-summary.json` 提取到的核心 UI：

- 页面标题：`生成 | Pollo AI`。
- 空状态文案：`哎呀！看来你还没有生成任何内容。`
- 主模式：`视频 / 图片 / 数字人 / 音频`。
- 工具 tabs：`工具 / 特效 / 转场 / 运镜`。
- 视频 composer：
  - placeholder：`输入灵感，即刻创造`。
  - tool：`文本/图像生视频`。
  - model：`Pollo 2.0` 或项目内可替换为 `Pika 2.2` / `梦影 2.2`。
  - meta：`5s / 480p / 16:9`，项目内可按需求改为 `5s / 720p / 16:9`。
  - button：`生成 10`。
- 图片 composer：`文本/图像生图像`、`Pollo Image 1.6`、`1:1`、`生成 4`。
- 数字人 composer：含 `配音内容`、`输入你想听的内容或 上传音频`、`画面表现 (可选)`、`长视频720p`、`生成 8`。
- 音频 composer：`在此输入需要转换成语音的文本...`、`文本转语音`。

## 视觉语言

复刻时优先抓这些，而不是只复制文案：

- 背景：接近黑色 `#08080b` / `#09090d`，大面积留白，控件浮在底部。
- 面板：深色半透明、轻毛玻璃、低对比描边。
- 圆角：外层 composer 20–28px；左侧 rail 24–32px；按钮 12–999px。
- 选中态：粉红/玫红渐变，细描边，轻微内高光和外发光。
- 非选中态：灰白文字，透明背景；hover 才略亮。
- 层级：空状态在中上部居中；composer 固定/粘在底部；工具 tabs 悬在 composer 上方；mode rail 贴在 composer 左边。
- 文案：中文短句，按钮不要太长；生成按钮可显示消耗额度。

## 执行流程

### Step 1 · 识别目标页面

先通过截图/路由判断要改：

- `HeroGenerator`：公开首页 hero 生成框。
- `LoggedInHome`：登录后首页中间大 composer。
- `CreateWorkspace`：点击“生成”后的 `/create` 页面底部 composer。

如果截图和用户描述冲突，以截图中的 chrome/侧边栏/页面结构为准，并简短说明“我会改登录后首页，不是公开首页”。

### Step 2 · 读取参考和现状

必须读取：

- 目标组件文件。
- `src/app/globals.css` 中对应 class 段。
- 若要参考 Pollo 创建页，读取 `figma-design/02-design/mockups/pollo-create-page-summary.json` 的相关片段。

不要盲改全局 `.chip` / `textarea`，优先用页面作用域 class，例如 `.create-inline-composer .chip`、`.dashboard-prompt-row textarea`。

### Step 3 · 做视觉拆解表

在脑中拆成五类，改代码时逐类落地：

1. **结构**：sidebar、空状态、tabs、rail、composer、footer chips、生成按钮。
2. **状态**：视频/图片/数字人/音频的 selected/unselected、disabled/ready。
3. **尺寸**：宽度、min-height、padding、gap、sticky bottom。
4. **质感**：背景透明度、border、shadow、blur、gradient。
5. **文案**：placeholder、tool chip、model、meta、button cost。

### Step 4 · 小步改造

- 先改 JSX 结构和数据模型，让模式文案统一从配置读取。
- 再改 CSS；保持页面作用域。
- 每次只改一个页面，不要同时重做公开首页、登录后首页和 `/create`。
- 用户说“直接平移过来”时，优先复刻截图布局，不要过度解释或重新设计。

### Step 5 · 验证

至少运行：

```bash
npm run typecheck --prefix ./shuang-video
npm run build --prefix ./shuang-video
```

如果是可视 UI 改动，尽量用本地 dev server 打开页面；如果当前环境无法视觉验证，明确说“编译已过，但未做浏览器像素验收”。

## 常见坑

- 用户看到的是登录后页面，你却改了公开首页。
- `/create` 左侧 rail 需要四类：`视频 / 图片 / 数字人 / 音频`，不是 `视频 / 图片 / 智能体`。
- 宽版 rail 显示文字+图标；窄版 rail 只显示图标。
- `agent` URL 参数可以兼容映射到 `avatar`，但 UI 显示应是 `数字人`。
- 不要把 Pollo 的品牌名直接放进 DreamFilm/Dream 项目；模型名可用项目自己的 `梦影` / `Dream` 系列。
- 不要改用户没要求的页面；如果不确定，先问或先说明目标页面。

## Pollo 参考文件使用方式

需要复刻 `/create` 时，优先搜索摘要：

```bash
grep -n "视频\|图片\|数字人\|音频\|工具\|特效\|转场\|运镜\|文本/图像生视频\|生成" figma-design/02-design/mockups/pollo-create-page-summary.json
```

需要检查真实 DOM：

```bash
grep -n "mode-option\|chat-mode-toggle\|文本/图像生视频\|Pollo 2.0" figma-design/02-design/mockups/pollo-create-page-captured.html | head
```

这些文件是参考资产，不要直接复制外站代码；将视觉结构和交互状态转译成本项目组件与 CSS。
