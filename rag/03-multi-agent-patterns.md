# 03 — 多智能体协作模式

> 来源：`part14-agent-help/`（Supervisor/Swarm/Hierarchical 代码）+ `part11-agent-design/` + Harness Engineering PDF  
> 对应项目：`forge_supervisor.py` `subagents/` `langgraph_workflow.py`

---

## 一、四大多智能体架构

### 1.1 架构速查表

| 模式 | 适用场景 | 通信方式 | 代码位置 |
|---|---|---|---|
| **Supervisor（监督者）** | 多任务并行，统一入口 | 主 Agent 调用子 Agent | `part14/code/flagship-supervisor-tool/` |
| **Swarm（蜂群）** | 无中心协作，任务在 Agent 间传递 | Handoff（移交控制权） | `part14/code/swarm-customer-service/` |
| **Hierarchical（层次化）** | 大型复杂任务，多层分解 | 层级调用 | `part14/code/hierarchical-software-delivery/` |
| **GAN（生成对抗）** | 高质量内容生成，需要独立评估 | Generator ↔ Evaluator | Anthropic 博文（2026-03-24） |

---

## 二、Supervisor 模式（最常用）

### 2.1 核心结构

```text
用户请求
   ↓
Supervisor（路由决策）
   ├── 判断需要哪些子 Agent
   ├── 分配任务
   └── 汇总结果
       ├── Agent A（专项：RAG 检索）
       ├── Agent B（专项：Web Search）
       ├── Agent C（专项：代码执行）
       └── Agent D（专项：写作生成）
```

### 2.2 LangGraph 实现

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, List
import operator

class AgentState(TypedDict):
    messages: Annotated[List, operator.add]
    next: str  # 下一个要执行的 Agent

# Supervisor 决策
def create_supervisor(llm, members: List[str]):
    system_prompt = f"""你是一个任务调度器，负责将工作分配给以下工作者：{members}。
    根据用户请求，决定下一步应该由谁来执行。
    当任务完成时，回复 FINISH。"""
    
    options = members + ["FINISH"]
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{messages}")
    ])
    
    from langchain_core.output_parsers.openai_functions import JsonOutputFunctionsParser
    
    return (
        prompt 
        | llm.bind_functions(
            functions=[{
                "name": "route",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "next": {"type": "string", "enum": options}
                    }
                }
            }],
            function_call="route"
        )
        | JsonOutputFunctionsParser()
    )

# 构建图
def build_supervisor_graph(agents: dict, supervisor_chain):
    workflow = StateGraph(AgentState)
    
    for name, agent in agents.items():
        workflow.add_node(name, agent)
    
    workflow.add_node("supervisor", 
        lambda state: supervisor_chain.invoke(state))
    
    # 所有 Agent 都回报给 Supervisor
    for name in agents:
        workflow.add_edge(name, "supervisor")
    
    # Supervisor 决定下一步
    workflow.add_conditional_edges(
        "supervisor",
        lambda state: state["next"],
        {**{name: name for name in agents}, "FINISH": END}
    )
    workflow.set_entry_point("supervisor")
    return workflow.compile()
```

### 2.3 ForgeAgent 的 Supervisor 设计

```python
# ProjectForge 中的 Supervisor 结构（harness-agent 对应阶段）
RESEARCH_AGENT = "researcher"      # 对应 harness 阶段 1: Research
PROTOTYPE_AGENT = "prototyper"     # 对应 harness 阶段 2: Prototype
PRODUCT_AGENT = "product_manager"  # 对应 harness 阶段 3: Product
BUILD_AGENT = "builder"            # 对应 harness 阶段 4-7: Build~Release
REVIEW_AGENT = "reviewer"          # 对应 harness 阶段 8: Eval
```

---

## 三、Swarm 模式（无中心协作）

### 3.1 核心特征

```text
Agent A ──handoff──→ Agent B ──handoff──→ Agent C
         （判断需要 B）         （判断需要 C）
```

- 没有中心 Supervisor
- 每个 Agent 自主决定是否移交（handoff）
- 适合对话式场景（客服、销售漏斗等）

### 3.2 关键实现

```python
# 使用 transfer_to_xxx 工具实现 handoff
from swarm import Swarm, Agent

def transfer_to_billing():
    """转移到账单处理 Agent"""
    return billing_agent

def transfer_to_technical():
    """转移到技术支持 Agent"""
    return technical_agent

general_agent = Agent(
    name="General Support",
    instructions="你是通用客服。如果是账单问题转给账单 Agent，技术问题转给技术 Agent。",
    functions=[transfer_to_billing, transfer_to_technical]
)

billing_agent = Agent(
    name="Billing",
    instructions="你处理账单相关问题。",
    functions=[process_refund, check_invoice]
)

# 对话
client = Swarm()
response = client.run(
    agent=general_agent,
    messages=[{"role": "user", "content": "我的账单有问题"}]
)
```

---

## 四、Hierarchical（层次化）模式

### 4.1 适用场景

大型软件项目交付：一个 Manager Agent 管理多个 Team Lead Agent，每个 Team Lead 管理多个 Worker Agent。

```text
Project Manager Agent
   ├── Frontend Team Lead Agent
   │     ├── UI Worker Agent
   │     └── Styling Worker Agent
   ├── Backend Team Lead Agent
   │     ├── API Worker Agent
   │     └── DB Worker Agent
   └── QA Team Lead Agent
         ├── Unit Test Agent
         └── Integration Test Agent
```

### 4.2 参考源码

```bash
../../agent/part14-agent-help/code/hierarchical-software-delivery/
├── README.md
├── backend/        # LangGraph 工作流
├── frontend/       # 可视化界面
└── requirements.txt
```

---

## 五、GAN 式三 Agent 架构（Anthropic 最新）

### 5.1 结构

```text
Planner（规划者）
   ↓ 产品规格
Generator（生成者） ←──────────────────────────────
   ↓ 实现                                          ↑
Evaluator（评估者）                            Sprint 迭代
   ↓ 四维评分（Design/Originality/Craft/Functionality）
   └── 分数未达标 → 反馈给 Generator → 下一轮 Sprint
   └── 分数达标 → DONE
```

### 5.2 Sprint Contract 协商（关键设计）

Generator 和 Evaluator 在每轮 Sprint 前签订"合约"：
```json
{
  "sprint": 1,
  "deliverable": "首页布局 + 导航菜单",
  "success_criteria": [
    "页面在 1024px 和 375px 两种宽度下都能正常显示",
    "导航菜单包含至少 4 个入口",
    "首页加载时间 < 3 秒"
  ]
}
```

### 5.3 实验数据

| 模式 | 时间 | 成本 | 结果 |
|---|---|---|---|
| Solo Agent | 20 分钟 | $9 | 外观精美但游戏不可玩 |
| Full Harness（GAN） | 6 小时 | $200 | 物理引擎正常、可玩关卡、AI 自动内容生成 |

---

## 六、Sub-agent（Claude Code 原生）

### 6.1 Claude Code 子 Agent 特性

```yaml
# .claude/agents/researcher.md YAML frontmatter
---
name: researcher
description: "深度调研 Agent，负责搜索和分析技术资料"
tools:
  - web_search
  - read_file
  - bash
memory_scope: session  # session / global
---

你是一个技术调研专家...
```

### 6.2 从 harness-agent 调用子 Agent

```python
# pipeline.py 中触发子 Agent
# Stage 1 Research 阶段可以启动 researcher 子 Agent
def run_research_stage(workspace: str, product_idea: str) -> dict:
    """
    调用 researcher 子 Agent 完成研究阶段
    harness 负责：启动子 Agent + 等待产物 + 验证门禁
    """
    # 子 Agent 产物写入：{workspace}/.harness/research/
    # hstack gate 检验产物是否符合要求
    ...
```

---

## 七、对 harness-agent 的映射

| 多智能体概念 | harness-agent 对应 |
|---|---|
| Supervisor（路由决策） | `pipeline.py` 的阶段顺序（线性 Supervisor） |
| 子 Agent | CLAUDE.md 中注册的 Skills（/research /build /review） |
| GAN Evaluator | `evaluate_gates()` 的门禁检查函数 |
| Sprint Contract | `GateCheck` 模型（每阶段的门禁条件列表） |
| Handoff | `advance_run()` 阶段推进 |
| Progress File | `HarnessRun.json` |

---

## 八、源文件参考

```bash
# Supervisor 工具示例
../../agent/part14-agent-help/code/flagship-supervisor-tool/

# 客服 Swarm 示例
../../agent/part14-agent-help/code/swarm-customer-service/

# 分层软件交付示例
../../agent/part14-agent-help/code/hierarchical-software-delivery/

# 多智能体协作模式 notebook
../../agent/part14-agent-help/多智能体协作模式.ipynb

# 主流 Agent 类型及接口设计
../../agent/part11-agent-design/1_主流Agent类型及接口设计/
```
