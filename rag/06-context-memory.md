# 06 — 上下文工程 + 记忆管理

> 来源：`part09-agent-context/`（上下文工程）+ `part08-agent-memory/`（长短期记忆）  
> + Anthropic 博文：Effective Context Engineering for AI Agents（2025-09）  
> 对应项目：`memory_store.py` `context_manager.py`

---

## 一、Context Engineering 核心原则

### 1.1 Karpathy 定义

> "Context Engineering 是在上下文窗口中精心填充恰好合适的信息的艺术与科学，以最大化期望结果的可能性。"

**关键洞察**：注意力是有限资源，上下文越多 ≠ 效果越好。

### 1.2 Context Rot（上下文腐烂）

```text
随着 token 数增加：
  token 少  → 模型注意力集中 → 回忆准确率高
  token 多  → 注意力分散     → 早期信息回忆准确率下降
```

**应对策略**：找到"最小的高信号 token 集合，最大化期望结果的可能性"。

### 1.3 Just-in-Time 上下文检索

```text
静态加载（启动时）：CLAUDE.md / AGENTS.md（项目级知识）
动态检索（运行时）：glob/grep/vector search（任务相关知识）

不要在启动时塞入所有知识 → 运行时按需加载
```

---

## 二、上下文窗口管理策略

### 2.1 五种上下文管理技术

| 技术 | 描述 | 适用场景 |
|---|---|---|
| **Truncation（截断）** | 删掉最早的消息 | 简单对话场景 |
| **Summarization（摘要）** | 将历史对话压缩为摘要 | 多轮对话 |
| **Selective Retention（选择性保留）** | 只保留重要的消息/工具调用 | 复杂任务 |
| **Sliding Window（滑动窗口）** | 保持最近 N 条消息 + 系统摘要 | 长对话 |
| **External Memory（外部记忆）** | 将信息存入向量库，需要时检索 | 超长任务 |

### 2.2 LangGraph 的 Compaction 机制（Claude Code）

```bash
# Claude Code 的 /compact 命令
# 自动将当前 session 历史压缩为摘要，释放 context window 空间
/compact

# 等价的 Python 实现
from anthropic import Anthropic
client = Anthropic()

def compact_conversation(messages: list, keep_last_n: int = 5) -> list:
    """保留最近 N 条 + 生成历史摘要"""
    if len(messages) <= keep_last_n:
        return messages
    
    old_messages = messages[:-keep_last_n]
    recent_messages = messages[-keep_last_n:]
    
    # 生成历史摘要
    summary_response = client.messages.create(
        model="claude-3-5-haiku-20241022",
        max_tokens=500,
        system="你是对话摘要助手，生成简洁准确的对话摘要",
        messages=[
            {"role": "user", "content": f"请摘要以下对话：\n{old_messages}"}
        ]
    )
    
    summary = summary_response.content[0].text
    return [
        {"role": "user", "content": f"[历史摘要]\n{summary}"},
        *recent_messages
    ]
```

---

## 三、记忆系统架构

### 3.1 四种记忆类型

| 类型 | 定义 | 存储位置 | 持久性 |
|---|---|---|---|
| **In-Context（工作记忆）** | 当前 context window 中的信息 | token 流 | 会话内 |
| **External（外部记忆）** | 向量库 / 数据库 | 持久化存储 | 跨会话 |
| **Episodic（情节记忆）** | 对话历史 + 任务记录 | 数据库 | 中期 |
| **Semantic（语义记忆）** | 知识库 / 事实 | 向量库 | 长期 |

### 3.2 短期记忆（In-Context）实现

```python
from langchain_core.messages import HumanMessage, AIMessage
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

# 基于内存的短期记忆
store = {}

def get_session_history(session_id: str) -> ChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]

# 绑定到 Chain
chain_with_history = RunnableWithMessageHistory(
    base_chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history",
)

# 使用
response = chain_with_history.invoke(
    {"input": "你好"},
    config={"configurable": {"session_id": "user_123"}}
)
```

### 3.3 长期记忆（Vector Store）实现

```python
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
import json
from datetime import datetime

class LongTermMemory:
    """基于向量库的跨会话记忆"""
    
    def __init__(self, storage_path: str = "memory/"):
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        self.storage_path = storage_path
        self._load_or_create()
    
    def remember(self, content: str, metadata: dict = None) -> None:
        """存储新记忆"""
        from langchain.schema import Document
        doc = Document(
            page_content=content,
            metadata={
                "timestamp": datetime.now().isoformat(),
                "type": "episodic",
                **(metadata or {})
            }
        )
        self.vectorstore.add_documents([doc])
        self.vectorstore.save_local(self.storage_path)
    
    def recall(self, query: str, k: int = 5) -> list:
        """检索相关记忆"""
        return self.vectorstore.similarity_search(query, k=k)
    
    def _load_or_create(self):
        import os
        if os.path.exists(self.storage_path):
            self.vectorstore = FAISS.load_local(
                self.storage_path, self.embeddings,
                allow_dangerous_deserialization=True
            )
        else:
            # 创建空的向量库
            from langchain.schema import Document
            self.vectorstore = FAISS.from_documents(
                [Document(page_content="init", metadata={"type": "system"})],
                self.embeddings
            )
```

---

## 四、上下文组合编排（part09 核心）

### 4.1 五种注入策略

```python
# 策略一：静态注入（System Prompt）
# 适合：项目级规则、角色定义
system_prompt = """
你是一个企业知识库助手。
项目：{project_name}
约束：只回答与知识库相关的问题
"""

# 策略二：Few-Shot（示例注入）
# 适合：教 AI 特定格式或行为
few_shot_examples = [
    {"role": "user", "content": "什么是 RAG？"},
    {"role": "assistant", "content": "[格式示例答案...]"}
]

# 策略三：RAG 注入（检索增强）
# 适合：基于文档的问答
retrieved_docs = retriever.get_relevant_documents(query)
context = "\n\n".join([doc.page_content for doc in retrieved_docs])
augmented_prompt = f"基于以下上下文回答：\n{context}\n\n问题：{query}"

# 策略四：Tool Result 注入（工具结果）
# 适合：Agent 工具调用后的结果传递
tool_results = execute_tools(tool_calls)
messages.append({"role": "tool", "content": str(tool_results)})

# 策略五：Memory Injection（记忆注入）
# 适合：个性化、长期对话
relevant_memories = memory.recall(current_query, k=3)
memory_context = "\n".join([m.page_content for m in relevant_memories])
```

### 4.2 组合编排顺序（最佳实践）

```text
[System Prompt]
  └── 角色定义（100词内）
  └── 核心规则（3–5条）

[Long-term Memory]（若有）
  └── 用户历史偏好
  └── 相关历史对话摘要

[Retrieved Knowledge]（RAG）
  └── 当前问题相关的文档片段

[Conversation History]（最近 5–10 轮）
  └── 保留 HumanMessage + AIMessage

[Current Query]
  └── 用户当前输入
```

---

## 五、Harness Engineering 中的记忆设计

### 5.1 三类 Harness 记忆产物

```text
progress.json（会话交接记忆）
  └── 当前阶段、已完成功能、待处理问题
  └── 格式：严格 JSON（防篡改）

global-learnings.md（跨项目语义记忆）
  └── 所有踩过的坑和最佳实践
  └── 每次 Agent 犯错后更新

course-state.md（项目状态记忆）
  └── 已引入的概念、环境状态、叙事进度
```

### 5.2 harness-agent 中的记忆实现

```python
# models.py 中 HarnessRun 就是 progress.json
class HarnessRun(BaseModel):
    run_id: str
    workspace: str
    product_name: str
    current_stage: StageId
    stage_states: dict[StageId, StageState]
    created_at: str
    updated_at: str
    
    # Anthropic 两阶段协议的 JSON 防篡改设计
    # 存为 .harness/runs/{run_id}/run.json

# runner.py 中的会话启动协议
def start_session_protocol(workspace: str, run_id: str) -> str:
    """
    标准会话启动：
    1. 读取 run.json（知道做到哪了）
    2. 检查门禁状态（知道当前阶段是否通过）
    3. 读取 global-learnings.md（知道要避免什么坑）
    """
    run = load_run(workspace, run_id)
    stage_status = evaluate_gates(workspace, run)
    learnings = read_global_learnings(workspace)
    
    return f"""
    当前运行状态：
    - 产品：{run.product_name}
    - 当前阶段：{run.current_stage}
    - 门禁状态：{stage_status}
    
    历史经验（请遵守）：
    {learnings}
    """
```

---

## 六、Context Engineering vs Prompt Engineering 实战对比

```python
# ❌ 差的 Prompt Engineering 写法
bad_prompt = "帮我写一篇关于 RAG 的技术文章"

# ✅ 好的 Context Engineering 写法
good_context = f"""
[角色]你是一位有 5 年 AI 工程经验的技术作者，专注于 LLM 应用开发。

[受众]读者是有 Python 基础、刚开始学 AI Agent 的工程师。

[背景]这是系列文章的第 3 篇，前两篇已经介绍了 LLM API 调用和 Prompt Engineering。
本篇重点：RAG 的原理、实现和评估。

[约束]
- 长度：2000–3000字
- 必须有可运行的代码示例
- 引用真实的开源库（LangChain/LlamaIndex）

[任务]请撰写"RAG 检索增强生成"技术文章。
"""
```

---

## 七、记忆系统的 ForgeAgent 实现思路

```python
# work/ai-agent/portfolio/forge-rag-copilot/ 中的记忆设计
class ForgeMemoryManager:
    """ProjectForge 记忆管理器"""
    
    def __init__(self):
        # 短期：当前对话
        self.conversation_history = ChatMessageHistory()
        
        # 中期：项目上下文（本次 hstack run）
        self.project_context = {}  # 从 progress.json 读取
        
        # 长期：用户学习记录（全局）
        self.long_term_memory = LongTermMemory("~/.forge/memory/")
    
    def get_context_for_query(self, query: str) -> str:
        """为当前 query 组装最优上下文"""
        
        # 1. 检索相关长期记忆
        memories = self.long_term_memory.recall(query, k=3)
        
        # 2. 获取项目当前状态
        project_state = self.project_context.get("current_stage", "unknown")
        
        # 3. 压缩对话历史（超过 10 轮）
        history = compact_if_needed(self.conversation_history.messages)
        
        return f"""
        [项目状态] {project_state}
        [相关历史经验] {format_memories(memories)}
        [对话历史] {format_history(history)}
        """
```

---

## 八、源文件参考

```bash
# 上下文工程基础入门
../../agent/part09-agent-context/大模型Agent上下文工程基础入门.ipynb

# 上下文工程进阶（组合编排）
../../agent/part09-agent-context/大模型\ Agent\ 上下文工程进阶—组合编排实战.ipynb

# 记忆管理基础（短期/长期记忆）
../../agent/part08-agent-memory/大模型Agent长短期记忆管理基础入门.ipynb

# 记忆管理进阶
../../agent/part08-agent-memory/大模型Agent长短期记忆管理进阶实战.ipynb
```
