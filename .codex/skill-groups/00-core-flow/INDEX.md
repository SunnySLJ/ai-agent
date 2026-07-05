# 00 Core Flow

| skill | 状态 | 用途 |
|---|---|---|
| `shuang-flow` | canonical | Vibe Coding 全链路总调度 |
| `shuang-skill-rules` | active | skill 发现、优先级、Superpowers 边界 |
| `shuang-claude-md` | active | 生成/刷新 `AGENTS.md`、`CLAUDE.md` |
| `shuang-evolve` | canonical | 从任务复盘自动升级项目 skills |

默认先用 `shuang-flow` 判断阶段；任务收尾要沉淀长期经验时走 `shuang-evolve`；只有任务本身是在改 agent 指导文件时，才直接走 `shuang-claude-md`。
