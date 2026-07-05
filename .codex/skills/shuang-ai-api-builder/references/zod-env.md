# 环境变量 Zod 校验

用于为目标项目建立环境变量 schema、`.env.example` 和配置加载校验。

## 安全约束

- 不打印真实 secret 值。
- 不把真实 secret 写进 `.env.example`、代码块或报告。
- 只使用 `sk-...`、`sk-ant-...`、`https://example.com` 等占位值。
- 发现 `.env` / `.env.local` 时，只提取变量名，不回显变量值。

## 目标上下文

先判断目标是：

1. Next.js app。
2. Open Design / MCP / daemon 相关目录。
3. 普通 Node.js 脚本或服务。

用户没说清楚时先问目标路径。

## 只读扫描

- 目标目录 `package.json`。
- 现有 `.env.example`。
- 现有 `.env` / `.env.local` / `.env.production` 的变量名。
- `next.config.*`、`src/**/*.ts(x)`、`app/**/*.ts(x)` 中的 `process.env.` 使用点。

扫描后总结：目标目录用了 N 个环境变量，其中 M 个 server-only、K 个 `NEXT_PUBLIC_` client 变量、S 个 shared 变量。

## 分类规则

- server：`*_API_KEY`、`*_SECRET`、`*_TOKEN`、`DATABASE_URL` 等敏感变量，不能带 `NEXT_PUBLIC_`。
- client：`NEXT_PUBLIC_*` 会进入浏览器 bundle，不能放 secret。
- shared：`NODE_ENV`、`VERCEL_URL` 等非敏感共享变量。

默认校验：

- `*_URL` 用 `.url()`。
- `*_PORT`、`*_TIMEOUT`、`*_LIMIT` 用 `z.coerce.number()`。
- OpenAI key 可用 `.startsWith("sk-")`。
- Anthropic key 可用 `.startsWith("sk-ant-")`。
- 不认识的 secret 用 `.min(10)` 加中文说明。
- 不确定是否必填时先说明假设，不要把所有变量无脑必填。

## 输出

Next.js app 可生成：

- `src/env.ts` 或项目已有约定路径。
- `serverSchema` / `clientSchema` / `sharedSchema`。
- `next.config.ts` 顶部 import env 的建议。
- `.env.example` 增量内容。

Open Design / MCP / daemon 不强行生成 Next.js `src/env.ts`；输出适合该运行环境的 schema 与入口加载建议。
