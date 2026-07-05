# 调研工作流

当用户要求市场调研、源码调研、并行 research agent、或项目级搜索 MCP 安装时读取本文件。

## 项目级 MCP 安装模式

用户常见请求：

```text
请把 <source-path>/muyu-search-mcp 安装到当前项目里，
名字改成 shuang-search-mcp（项目级别，不要装到全局）。
先读 README，按里面的引导式安装方式来配。
```

执行规则：

- 默认项目级安装，不影响其他项目。
- 先读源目录 README，再改配置。
- 改名只在用户明确要求时执行。
- 安装后验证，并说明触发方式。

## 四路并行调研

适合独立问题域：

| Agent | 调研主题 | 输出 |
| --- | --- | --- |
| 1 | 产品形态调研 | `specs/research/01-产品形态.md` |
| 2 | 数据来源调研 | `specs/research/02-数据来源.md` |
| 3 | 开源项目调研 | `specs/research/03-开源项目.md` |
| 4 | 实现方案调研 | `specs/research/04-实现方案.md` |

每个 agent 尽量双路交叉验证：

1. 内置 web search/fetch。
2. 项目搜索 MCP，例如 `shuang-search-mcp`。

4 份调研都完成后，由主会话读取并写：

```text
specs/research/05-决策汇总.md
```

## Subagent Prompt 四要素

每个并行任务提示词必须包含：

1. Focused scope：单一问题域。
2. Self-contained context：不依赖父会话隐含上下文。
3. Constraints：不要做什么。
4. Expected output：明确文件路径和格式。
