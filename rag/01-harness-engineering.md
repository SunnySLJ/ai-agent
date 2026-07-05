# 01 — Harness Engineering 核心理论

> 来源：`part19-agent-harness/` + `part24-agent-harness-special/`  
> 提炼：两篇核心 PDF（Harness Engineering 技术实战 + GStack 项目实战）精华

---

## 一、核心定义与公式

```
Agent 系统有效输出 = 模型能力 × Harness 设计水平
```

**Harness Engineering** 是设计、构建和持续优化 AI Agent **运行时环境**的工程学科，通过四类机制将 Agent 的可靠性从"演示级"提升到"生产级"：
1. 声明式知识注入（项目配置文件）
2. 自动化行为约束（生命周期钩子与规则引擎）
3. 多层反馈循环（从即时检查到独立评估 Agent）
4. 系统熵管理（持续清理 Agent 产出的技术债）

**关键洞察**：LangChain 不换模型仅改 Harness，Terminal Bench 2.0 排名从 30+ 升至 Top 5（+13.7pp），效果是换模型（+6.8pp）的 2 倍。

---

## 二、三个时代对比

| 时代 | 核心问题 | 工作单位 | 人类角色 | 典型工具 |
|---|---|---|---|---|
| Prompt Engineering（2024） | 我怎么措辞？ | 单次 API 调用 | 提示词作者 | ChatGPT |
| Context Engineering（2025） | 给模型喂什么信息？ | 多轮对话/工具链 | 信息架构师 | RAG、MCP |
| **Harness Engineering（2026）** | **Agent 需要什么环境才能自主工作？** | **完整功能（从需求到交付）** | **环境设计师** | **CLAUDE.md、Hooks、Sub-agents** |

> 三个时代是**包含关系**，不是替代。Harness 从业者仍需写好提示词、管好上下文。

---

## 三、四大支柱

### 支柱一：代码库即真相源（Codebase as Source of Truth）

**核心机制**：在项目根目录放置 `CLAUDE.md` / `AGENTS.md`，Agent 每次启动自动读取。

**三层配置策略**（Claude Code）：

| 层级 | 路径 | 作用域 | 内容 |
|---|---|---|---|
| 全局 | `~/.claude/CLAUDE.md` | 所有项目 | 个人偏好（语言、风格） |
| 项目 | `./CLAUDE.md` | 当前项目 | 技术栈、命令、规范、约束 |
| 个人 | `./.claude/local.md` | 仅自己 | 个人在该项目的特殊偏好 |

**OpenAI 关键教训**：
- `AGENTS.md` 约 **100 行**为黄金标准，是"地图"而非百科全书
- 结构：`AGENTS.md`（导航）→ `docs/architecture.md`、`docs/conventions.md`、`docs/api-spec.md`

**Hashimoto 法则**：每当 Agent 犯一个错误，就工程化一个永久解决方案（写进 AGENTS.md），让这个错误**永远不再发生**。

```bash
Agent 犯错 → 分析根因 → 写成规则 → 加入 AGENTS.md
          ↓
下次 Agent 启动时自动读取 → 永不再犯
```

**对 harness-agent 的应用**：
- `harness-agent/AGENTS.md` 就是第一支柱的实现
- 每次跑 `hstack gate` 发现新问题 → 补规则

---

### 支柱二：机械化架构约束（Mechanized Architectural Constraints）

**核心思想**：`CLAUDE.md` 是**建议**，`Hooks` 是**法律**。

#### Claude Code Hooks 系统

四种处理器类型：

| 类型 | 执行方式 | 适用场景 | 示例 |
|---|---|---|---|
| `command` | Shell 命令 | 文件操作、脚本检查 | `bash firewall.sh` |
| `prompt` | LLM 单轮评估 | 代码审查、风险评估 | "检查是否引入安全风险" |
| `agent` | 启动完整 Agent | 复杂多步验证 | 验证单元测试是否通过 |
| `http` | HTTP POST | 外部系统集成 | POST 到 Slack 通知 |

退出码设计：
- `0` → 通过，继续执行
- `2` → **拦截**，阻止当前操作（魔法数字）
- 其他 → 忽略（Hook 自身错误不影响主流程）

#### 典型 Hooks 场景

```bash
# 场景1：安全防火墙（PreToolUse）
# 检测 rm -rf / 等危险命令，exit 2 拦截

# 场景2：提交前自动质量检查（PreToolUse on git commit）
# 自动运行 ruff check . → 若有错，exit 2 拦截，错误报告反馈给 Agent

# 场景3：任务完成桌面弹窗通知（Stop 事件）
# osascript 弹出通知："Claude Code 任务已完成"
```

#### Prompt Hook vs Command Hook

| 对比 | command Hook | prompt Hook |
|---|---|---|
| 检测方式 | 字符串模式匹配 | 语义理解 |
| 速度 | 毫秒级 | 1–3 秒 |
| 能力 | 检测已知危险模式 | 发现未知风险（如 API breaking change） |
| 成本 | 零（本地执行） | 消耗 API 额度 |

**最佳实践**：双层防线——`command` Hook 高速过滤 99% 明显问题，`prompt` Hook 兜住语义层风险。

#### OpenAI 六层分级约束
```
Types → Config → Repo → Service → Runtime → UI
  ↑       ↑        ↑       ↑         ↑       ↑
每层只能依赖上层，严禁反向依赖
违反 → 结构测试自动报错 → Agent 被阻止
```

**反直觉洞察**：收窄解空间反而提高成功率。Vercel 删掉 80% 的 Agent 工具后，效果反而更好。

---

### 支柱三：反馈循环（Feedback Loops）

**核心**：让 Agent 在每一步都能自动获知"做得对不对"。

#### 四层反馈机制

| 层级 | 触发时机 | 机制 | 代表实现 |
|---|---|---|---|
| 即时反馈 | 工具调用前后 | Hooks | Claude Code PreToolUse/PostToolUse |
| 构建反馈 | PR 创建时 | CI/CD Pipeline | GitHub Actions |
| 运行时反馈 | 应用部署后 | 可观测性工具 | 日志、指标 |
| 评审反馈 | 功能完成后 | **独立评估者** | Anthropic Evaluator Agent |

#### Anthropic 两阶段会话协议（长时运行 Agent）

```text
Phase 1 — Initializer Agent（首次会话）：
  → 创建项目骨架
  → 生成 init.sh（一键启动脚本）
  → 生成 progress.json（功能清单，用 JSON 防止意外篡改）

Phase 2 — Coding Agent（后续每次会话）：
  1. pwd → 确认自己在哪
  2. git log + progress.json → 了解做到哪了
  3. 选最高优先级的未完成功能
  4. init.sh → 启动开发服务器
  5. 跑端到端测试 → 确认基线正常
```

**关键设计细节**：
- 功能清单用 **JSON** 而非 Markdown（JSON 的刚性格式防止意外篡改）
- Git commit 本身就是最佳进度追踪（描述性 commit message）
- Puppeteer/Playwright MCP 做端到端测试（浏览器级别验证）

#### LangChain Doom Loop 检测

```python
# LoopDetectionMiddleware：监控单个文件的编辑次数
# 当 style.css 被编辑第 6 次仍未通过测试：
# → 自动注入提示："你已经修改这个文件 6 次了，考虑重新评估方法"
```

#### GAN 式三 Agent 架构（Anthropic 最新，2026-03-24）

```text
Planner（规划者）→ 把简短描述扩展为完整产品规格
Generator（生成者）→ 按 Sprint 迭代实现功能  
Evaluator（评估者）→ 用 Playwright 做端到端测试，客观标准打分
```

Sprint Contract 协商：Generator 和 Evaluator 在开工前明确"本轮交付物 + 可测试的成功标准"。

**洞察**：调校独立评估者的怀疑度，比让生成者对自己的工作保持批判性要容易得多。

---

### 支柱四：熵管理（Entropy Management）

**AI 代码特有的四种"垃圾"**：

| 熵类型 | 表现 | 根因 |
|---|---|---|
| 文档漂移 | 注释说的和代码做的不一致 | Agent 改了代码但忘了更新注释 |
| 架构侵蚀 | 绕过设计约束的捷径代码越来越多 | Agent 倾向最短路径 |
| 风格不一致 | 同一项目出现多种命名风格 | 不同会话的 Agent 不记得之前的风格 |
| 重复代码 | 相似但不完全相同的代码散落各处 | Agent 重新实现已有功能而非复用 |

**OpenAI "垃圾回收"方法**：
1. 将编码原则固化为 `linter` 规则：品味捕获一次，强制执行无限次
2. 后台 Agent 定期扫描：文档不一致、约束违规、架构漂移
3. 持续重构而非积压技术债

**Bitter Lesson（苦涩的教训）**：
> Harness 必须设计成可删除的。今天需要复杂管线完成的任务，明天可能一个提示词就搞定了。
- Manus：6 个月内重构 Harness 5 次
- Vercel：删掉 80% 工具后效果更好
- LangChain：一年内重架构 3 次

设计原则：`Start Simple` + `Build to Delete`（为删除而构建）

---

## 四、GStack 三大设计哲学（Garry Tan / YC CEO）

### 哲学一：角色即约束（Role as Constraint）

给 AI 明确的角色边界，产出质量显著优于"通才 AI"。

```
通才 AI：  "帮我看看代码有没有问题" → 广而不深
角色化 AI：/review（偏执的高级工程师）→ 专找"CI 过但生产会炸的 bug"
```

### 哲学二：把湖烧开（Boil the Lake）

有了 AI 辅助，完整实现的边际成本趋近于零——永远选择完整方案。

> "湖"是可以烧开的（100% 测试覆盖、完整功能实现）  
> "海洋"是烧不开的（从零重写整个系统）

### 哲学三：造之前先搜（Search Before Building）

知识三层框架：
1. **Layer 1**：久经考验的方案（Tried & True）→ 优先采用
2. **Layer 2**：新兴流行方案（New & Popular）→ 审慎评估
3. **Layer 3**：第一性原理（First Principles）→ 最有价值，命名为"Eureka Moment"

---

## 五、GStack 七步冲刺工作流

```
Think → Plan → Build → Review → Test → Ship → Reflect
  ↓       ↓       ↓       ↓       ↓      ↓       ↓
/office-hours  /plan-*  Build  /review  /qa+/cso  /ship  /retro
```

每步输出是下一步输入——不是独立工具，而是流水线。

| 步骤 | 阶段 | 对应 Skill | 输出 |
|---|---|---|---|
| 1 | Think | `/office-hours` | 经灵魂拷问的设计文档 |
| 2 | Plan | `/plan-ceo-review` `/plan-eng-review` | 范围决策 + 架构图 + 测试矩阵 |
| 3 | Build | Claude Code 原生能力 | 可运行代码 |
| 4 | Review | `/review` `/design-review` | 审查报告 + 自动修复 |
| 5 | Test | `/qa` `/cso` | 测试报告 + 安全审计 |
| 6 | Ship | `/ship` `/land-and-deploy` | GitHub PR + 部署 |
| 7 | Reflect | `/retro` | 复盘报告 |

---

## 六、对 harness-agent 项目的直接映射

| Harness 概念 | harness-agent 对应实现 |
|---|---|
| CLAUDE.md / AGENTS.md（支柱一） | `harness-agent/AGENTS.md` + 各项目 `CLAUDE.md` |
| Hooks（支柱二） | `hstack gate` 的门禁检查逻辑 |
| 反馈循环（支柱三） | `evaluate_gates()` + Progress File |
| 熵管理（支柱四） | `hstack retro` 阶段 + `global-learnings.md` |
| GStack SKILL.md | `harness-agent/src/harness_agent/` 各阶段模板 |
| 七步工作流 | `pipeline.py` 九阶段流水线 |
| Sprint Contract | `hstack gate` 门禁条件定义 |

---

## 七、行业标杆数据速查

| 团队 | 规模 | 核心成果 | Harness 关键机制 |
|---|---|---|---|
| OpenAI Codex | 3→7 人 | 5个月 100万行零手写 | AGENTS.md + 六层约束 + 垃圾回收 |
| Stripe Minions | 企业级 | 每周 1,300+ PR | Blueprint 审批 + CI/CD + 人工终审 |
| LangChain | 开源 | 排名 30+ → Top 5（+13.7pp） | 系统提示 + 工具 + Doom Loop 检测 |
| GStack (Garry Tan) | 个人 | 60天 60万行，48k⭐ | 项目配置 + 28角色定义 + Sprint流程 |

---

## 八、学习资源链接

| 资源 | 说明 |
|---|---|
| OpenAI Harness Engineering 方法论 | `openai.com/index/harness-engineering` |
| Anthropic Long-Running Agents | `anthropic.com/.../effective-harnesses` |
| Anthropic GAN 式架构 | `anthropic.com/.../harness-design-long-running-apps` |
| Mitchell Hashimoto 博文 | `mitchellh.com/writing/my-ai-adoption-journey` |
| GStack by Garry Tan | `github.com/garrytan/gstack` |
| LangChain Terminal Bench 2.0 | `blog.langchain.com/...` |
