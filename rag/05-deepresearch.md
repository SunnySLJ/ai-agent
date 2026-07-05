# 05 — DeepResearch Agent 构建模式

> 来源：`part22-agent-workspace/案例4：DeepResearch+Agent/`  
> 源文件：`基于DeepResearch Agent构建企业级自动化调研系统.ipynb` + `Agent_深度搜索_加强版.yml`  
> 对应项目：`work/ai-agent/portfolio/forge-rag-copilot/deep_research.py`

---

## 一、DeepResearch 核心思想

DeepResearch（深度调研 Agent）是一种**迭代式、反思式**的搜索-生成模式，对比普通搜索的区别：

| 对比维度 | 普通 RAG/搜索 | DeepResearch |
|---|---|---|
| 搜索次数 | 1–3 次 | 多轮迭代（通常 5–20 次） |
| 思考深度 | 检索 → 生成 | 检索 → 分析缺口 → 再检索 → 综合 |
| 信息来源 | 向量库 | 向量库 + Web + 结构化数据 |
| 适用场景 | 简单问答 | 复杂调研报告、竞品分析、技术选型 |
| 控制流 | 线性 | 循环（知道缺口 → 继续搜索） |

---

## 二、DeepResearch 工作流

### 2.1 核心循环

```text
用户调研需求（topic + scope）
   ↓
初始规划（Initial Plan）
├── 分解成子问题列表
└── 确定搜索策略
   ↓
┌─── 迭代搜索循环（max_iterations 轮）───────────────┐
│  搜索（Web Search / 向量库 / 工具调用）              │
│     ↓                                              │
│  提取信息（Extract Key Facts）                      │
│     ↓                                              │
│  更新知识库（Working Notes）                         │
│     ↓                                              │
│  反思（Reflect）：我还缺少什么？→ 生成新的子问题      │
│     ↓                                              │
│  判断：知识是否足够？                                │
│  ├── 是 → 退出循环                                  │
│  └── 否 → 继续搜索                                  │
└─────────────────────────────────────────────────────┘
   ↓
综合报告生成（Synthesis）
   ↓
质量自检（Self-Review）
   ↓
最终报告
```

### 2.2 关键组件

```python
# State 定义
class DeepResearchState(TypedDict):
    topic: str                    # 调研主题
    sub_questions: List[str]      # 待解答的子问题列表
    working_notes: str            # 收集到的信息（累积）
    sources: List[dict]           # 参考来源
    iteration: int                # 当前迭代次数
    max_iterations: int           # 最大迭代次数（防死循环）
    final_report: str             # 最终报告
    is_complete: bool             # 是否完成
```

---

## 三、LangGraph 实现（核心代码模式）

```python
from langgraph.graph import StateGraph, END
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
search_tool = TavilySearchResults(max_results=5)

# ─── 节点函数 ───

def plan_research(state: DeepResearchState) -> DeepResearchState:
    """生成调研计划：将主题分解为 3–5 个子问题"""
    plan_prompt = f"""
    调研主题：{state["topic"]}
    
    请将这个调研任务分解为 3–5 个具体的子问题，
    这些子问题的答案组合在一起能形成完整的调研报告。
    
    以 JSON 格式输出：{{"sub_questions": ["问题1", "问题2", ...]}}
    """
    response = llm.invoke(plan_prompt)
    # 解析并更新子问题
    ...
    return state

def search_and_extract(state: DeepResearchState) -> DeepResearchState:
    """针对当前最优先的子问题进行搜索"""
    if not state["sub_questions"]:
        return state
    
    current_question = state["sub_questions"][0]
    results = search_tool.invoke(current_question)
    
    # 提取关键信息
    extract_prompt = f"""
    问题：{current_question}
    搜索结果：{results}
    
    提取与问题直接相关的关键事实和数据点。
    格式：简洁的要点列表
    """
    extracted = llm.invoke(extract_prompt)
    
    # 更新 working_notes
    state["working_notes"] += f"\n\n## {current_question}\n{extracted.content}"
    state["sub_questions"] = state["sub_questions"][1:]  # 移除已处理的问题
    state["iteration"] += 1
    return state

def reflect_and_plan(state: DeepResearchState) -> DeepResearchState:
    """分析信息缺口，生成新的子问题"""
    reflect_prompt = f"""
    调研主题：{state["topic"]}
    已收集信息：{state["working_notes"]}
    
    分析：
    1. 我们已经了解了什么？
    2. 还缺少哪些关键信息？
    3. 生成 0–3 个新的子问题来填补缺口
    （如果信息已充分，返回空列表）
    
    格式：{{"new_questions": [...], "is_sufficient": true/false}}
    """
    response = llm.invoke(reflect_prompt)
    # 解析并更新子问题列表
    ...
    return state

def synthesize_report(state: DeepResearchState) -> DeepResearchState:
    """综合所有信息生成最终报告"""
    synthesis_prompt = f"""
    调研主题：{state["topic"]}
    收集到的信息：{state["working_notes"]}
    
    基于以上信息，生成一份结构完整的调研报告，包含：
    1. 执行摘要（关键发现）
    2. 详细分析（各子主题深度分析）
    3. 竞品/技术对比表格
    4. 结论与建议
    5. 参考来源
    """
    report = llm.invoke(synthesis_prompt)
    state["final_report"] = report.content
    state["is_complete"] = True
    return state

# ─── 条件边 ───

def should_continue(state: DeepResearchState) -> str:
    if state["is_complete"]:
        return "synthesize"
    if state["iteration"] >= state["max_iterations"]:
        return "synthesize"  # 超出迭代上限，强制生成报告
    if not state["sub_questions"]:
        return "reflect"     # 子问题答完了，反思是否需要更多
    return "search"          # 继续搜索

# ─── 构建图 ───

workflow = StateGraph(DeepResearchState)
workflow.add_node("plan", plan_research)
workflow.add_node("search", search_and_extract)
workflow.add_node("reflect", reflect_and_plan)
workflow.add_node("synthesize", synthesize_report)

workflow.set_entry_point("plan")
workflow.add_edge("plan", "search")
workflow.add_conditional_edges("search", should_continue, {
    "search": "search",
    "reflect": "reflect",
    "synthesize": "synthesize"
})
workflow.add_conditional_edges("reflect", should_continue, {
    "search": "search",
    "synthesize": "synthesize"
})
workflow.add_edge("synthesize", END)

app = workflow.compile()
```

---

## 四、深度搜索加强版 YAML（案例4 源文件）

```yaml
# 来源：部分参考 Agent_深度搜索_加强版.yml（路径见下）
# 关键配置参数

deep_search:
  max_search_iterations: 10      # 最大搜索轮数
  min_information_score: 0.8    # 信息充分度阈值
  search_engines:
    - tavily                     # 主搜索引擎
    - serper                     # 备用
  reflection:
    enabled: true
    max_new_questions: 3        # 每轮最多生成 3 个新问题
  synthesis:
    format: markdown             # 报告格式
    min_words: 1000              # 最少字数
    require_sources: true        # 必须包含来源引用
```

---

## 五、企业级扩展（对应项目 forge-rag-copilot）

### 5.1 与向量库集成

```python
# 优先查内部知识库，不足再 Web Search
def smart_search(question: str, vectorstore, search_tool) -> str:
    # 先查内部文档
    internal_docs = vectorstore.similarity_search(question, k=3)
    
    # 评估内部结果质量
    relevance_score = evaluate_relevance(question, internal_docs)
    
    if relevance_score > 0.7:
        return format_docs(internal_docs)  # 内部已有，不用 Web
    else:
        # 内部不足，用 Web Search 补充
        web_results = search_tool.invoke(question)
        return f"{format_docs(internal_docs)}\n\n{web_results}"
```

### 5.2 带引用的可信度追踪

```python
class SourcedFact(BaseModel):
    claim: str
    source_url: str
    source_title: str
    confidence: float  # 0–1
    
# 在提取信息时同时记录来源
def extract_with_sources(text: str, url: str) -> List[SourcedFact]:
    ...
```

### 5.3 流式输出（UX 优化）

```python
# 使用 LangGraph 的 stream 接口实时推送进度
async def run_deep_research_stream(topic: str):
    async for chunk in app.astream({"topic": topic, ...}):
        if "search" in chunk:
            yield f"🔍 搜索中：{chunk['search']['sub_questions'][0] if chunk['search']['sub_questions'] else '反思缺口'}"
        elif "synthesize" in chunk:
            yield f"✍️ 生成报告中..."
        elif "final_report" in chunk.get("synthesize", {}):
            yield chunk["synthesize"]["final_report"]
```

---

## 六、DeepResearch 在 harness-agent 阶段一的应用

在 `hstack` 的第 1 阶段（Research），可以调用 DeepResearch Agent 自动完成：

```python
# runner.py 中的 research stage runner
def run_research_stage(workspace: str, product_idea: str) -> StageResult:
    """
    使用 DeepResearch Agent 自动完成调研阶段
    
    产物：
    - .harness/research/research.md（竞品分析 + 技术选型）
    - .harness/research/sources.json（参考来源）
    
    门禁检查：
    - 包含"竞品分析"章节 ✓
    - 包含"技术选型"章节 ✓
    - 字数 > 500 ✓
    """
    research_result = deep_research_app.invoke({
        "topic": f"产品: {product_idea} 的竞品分析和技术选型",
        "max_iterations": 8,
    })
    
    # 写入产物
    write_artifact(workspace, "research/research.md", research_result["final_report"])
    write_artifact(workspace, "research/sources.json", research_result["sources"])
    
    return evaluate_stage_gates(workspace, "research")
```

---

## 七、源文件参考

```bash
# DeepResearch 案例 notebook
../../agent/part22-agent-workspace/案例4：DeepResearch+Agent/基于DeepResearch\ Agent构建企业级自动化调研系统.ipynb

# 深度搜索配置 YAML
../../agent/part22-agent-workspace/案例4：DeepResearch+Agent/Agent_深度搜索_加强版.yml
```

---

## 八、常见问题

| 问题 | 原因 | 解决方案 |
|---|---|---|
| 死循环（无法收敛） | 子问题永远无法被满足 | 设置 `max_iterations`（推荐 10–15） |
| 报告质量低 | `working_notes` 信息太杂 | 在 Extract 步骤加强结构化提取 |
| 搜索结果重复 | 子问题重叠 | 在生成新子问题时让 LLM 对比已有问题，避免重复 |
| 成本过高 | 每轮都用 GPT-4o | 搜索/提取用 gpt-4o-mini，最终综合用 gpt-4o |
| Web 搜索被限速 | Tavily 免费额度 | 加指数退避重试；备用 Serper |
