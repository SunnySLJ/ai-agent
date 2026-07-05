# 流式 AI API Route

用于在明确的 Next.js App Router 应用中生成流式 AI API route。

## 先判断是否需要流式

任一为“否”时，优先建议普通 API + loading 状态；用户坚持要流式时继续并说明复杂度：

1. AI 响应通常超过 3 秒吗？
2. 用户需要看到生成过程吗？
3. 前端会消费流式数据，例如 `useObject` / `useChat` 吗？

## 目标 app 预检

用户未明确目标 app 时先问路径。确认后只读检查：

- `<target>/package.json` 是否存在 `next`。
- `<target>/next.config.*` 是否存在。
- 使用 `<target>/app` 还是 `<target>/src/app`。
- 是否已安装 `ai`、`@ai-sdk/*`、`zod` 或用户指定 provider SDK。

如果不是 Next.js App Router 项目，停止说明不适用。

## 路由三件套

用户已给出下面三项时不要反复追问：

- route 路径，例如 `/api/report`。
- 输入形状，例如 `{ product: string }`。
- 输出形状，例如 `{ pros: string[]; score: number }`。

没有 schema 时可内嵌示范 schema，并建议生产前先走 `references/schema-design.md`。

## Route 要求

- 路径按目标 app 目录生成：`app/api/.../route.ts` 或 `src/app/api/.../route.ts`。
- 明确 runtime：Edge 或 Node.js，按 provider SDK 兼容性选择。
- 设置 `maxDuration` 前确认部署平台支持。
- `streamObject` 必须带错误处理。
- system prompt 必须强调严格遵守 schema。
- 不把真实 key 写进代码。

## 前端消费

如需客户端组件：

- 处理流式 `DeepPartial`，渲染前使用 `?.` 或条件判断。
- 覆盖 loading、error、empty、partial streaming。
- import alias、组件路径和 UI 组件用目标 app 现有约定。

## `.env.example`

只写占位值，例如：

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_BASE_URL=https://example.com/v1
```

如果已有 `.env.example`，先读取再增量追加，不能覆盖。

## 验证

按目标项目真实 scripts 选择 typecheck、lint、build。涉及 UI 时，说明是否完成浏览器验证。不要在非目标 app 根目录盲目运行构建。
