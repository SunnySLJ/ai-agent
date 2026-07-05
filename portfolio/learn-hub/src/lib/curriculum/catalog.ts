/**
 * 学习资料总目录 — 单一事实来源
 * 对齐 work/ai-agent/shuang-plan.md §8.1 / §8.2 / §8.3
 */

export type CategoryId =
  | "rag"
  | "agent"
  | "eval"
  | "engineering"
  | "deploy"
  | "portfolio";

export const CATEGORIES: Record<
  CategoryId,
  { label: string; color: string; description: string }
> = {
  rag: {
    label: "RAG 检索",
    color: "hsl(158 80% 45%)",
    description: "切分、向量库、混合检索、Citation、拒答",
  },
  agent: {
    label: "Agent 编排",
    color: "hsl(195 85% 55%)",
    description: "LangGraph、Supervisor、多 Agent、DeepResearch",
  },
  eval: {
    label: "评估测试",
    color: "hsl(258 70% 65%)",
    description: "Eval 数据集、指标、trace、测试闭环",
  },
  engineering: {
    label: "工程化",
    color: "hsl(35 90% 60%)",
    description: "FastAPI、Harness、MCP、Prompt 安全",
  },
  deploy: {
    label: "部署",
    color: "hsl(0 70% 60%)",
    description: "Docker Compose、健康检查、HTTPS",
  },
  portfolio: {
    label: "作品集",
    color: "hsl(158 75% 55%)",
    description: "ProjectForge 三引擎与面试讲法",
  },
};

export type WeekId = "W1" | "W2" | "W3" | "W4" | "W5" | "W6";

export const WEEKS: Record<
  WeekId,
  {
    theme: string;
    course: string;
    engineering: string;
    harness: string;
  }
> = {
  W1: {
    theme: "RAG 面试闭环",
    course: "part05 复习 + part13 eval",
    engineering: "跑通 eval 100%；熟记 demo 脚本",
    harness: "hstack init 第一个 run",
  },
  W2: {
    theme: "查证 + 案例11",
    course: "part22 案例11/12",
    engineering: "加深 verified_knowledge；读 case11 对照文档",
    harness: "完成 research + prototype 阶段 gate",
  },
  W3: {
    theme: "LangGraph + 编排",
    course: "part04 LangGraph",
    engineering: "ADR 0002；对比 graph_orchestrator.py",
    harness: "完成 architecture + solution 阶段",
  },
  W4: {
    theme: "DeepResearch + Forge",
    course: "part22 案例4 + part14",
    engineering: "Forge 第二轮 demo；外网 key 配置",
    harness: "完成 prd + development 阶段",
  },
  W5: {
    theme: "Harness 工程",
    course: "part19 + shuang-flow",
    engineering: "hstack 跑完 side project ①～⑦",
    harness: "测试 + 部署产物模板填完",
  },
  W6: {
    theme: "测试 + 复盘",
    course: "part12 + shuang-chain 概念",
    engineering: "Harness ⑧～⑨；compose 稳定性",
    harness: "第一个 side project 全链路 retro",
  },
};

/** §8.1 知识点 — 与 progress 表 id 对齐 */
export const TOPICS = [
  {
    id: "p01",
    week: "W1" as WeekId,
    category: "engineering" as CategoryId,
    title: "FastAPI 服务化",
    standard: "路由、Pydantic、SSE、健康检查",
    course: "part10-agent",
    code: "portfolio/agent-platform/src/agent_platform/api.py",
    status: "done" as const,
  },
  {
    id: "p02",
    week: "W1",
    category: "rag",
    title: "RAG 切分与入库",
    standard: "PDF/MD 解析、chunk 策略",
    course: "part05-agent-rag",
    code: "document_parser.py",
    status: "done",
  },
  {
    id: "p03",
    week: "W1",
    category: "rag",
    title: "混合检索",
    standard: "BM25 + 向量 + rerank 思路",
    course: "part05-agent-rag",
    code: "retrieval.py",
    status: "done",
  },
  {
    id: "p04",
    week: "W1",
    category: "rag",
    title: "Qdrant 向量库",
    standard: "upsert、query、citation",
    course: "part05-agent-rag",
    code: "vector_store.py",
    status: "done",
  },
  {
    id: "p05",
    week: "W1",
    category: "rag",
    title: "Citation 与拒答",
    standard: "无证据不答、trace 回放",
    course: "part05、part13",
    code: "agent.py",
    status: "done",
  },
  {
    id: "p06",
    week: "W1",
    category: "engineering",
    title: "Prompt 安全",
    standard: "注入拦截、safety_blocked",
    course: "part03、part11",
    code: "safety.py",
    status: "done",
  },
  {
    id: "p07",
    week: "W1",
    category: "engineering",
    title: "OpenAI 兼容 API",
    standard: "chat + embedding 适配",
    course: "part01-agent-api",
    code: "llm.py、embeddings.py",
    status: "done",
  },
  {
    id: "p08",
    week: "W1",
    category: "eval",
    title: "Agent 评估",
    standard: "pass_rate、refusal、MRR",
    course: "part13-agent-score",
    code: "agent-eval-dashboard/",
    status: "done",
  },
  {
    id: "p09",
    week: "W2",
    category: "rag",
    title: "Claim-Evidence 查证",
    standard: "文档审核式对齐、门控",
    course: "part22 案例11/12",
    code: "verified_knowledge.py",
    status: "done",
  },
  {
    id: "p12",
    week: "W3",
    category: "agent",
    title: "LangGraph 官方",
    standard: "与自研状态机对比",
    course: "part04-agent-langchain",
    code: "docs/decisions/0002-langgraph.md",
    status: "learning",
  },
  {
    id: "p10",
    week: "W4",
    category: "agent",
    title: "DeepResearch",
    standard: "子问题 + 外网 + 脚注",
    course: "part22 案例4",
    code: "deep_research.py",
    status: "done",
  },
  {
    id: "p11",
    week: "W4",
    category: "agent",
    title: "多 Agent 编排",
    standard: "Supervisor、九阶段",
    course: "part14-agent-help",
    code: "project_forge.py",
    status: "done",
  },
  {
    id: "p15",
    week: "W5",
    category: "engineering",
    title: "Harness 工程化",
    standard: "阶段门、产物、CLI",
    course: "part19、part24",
    code: "harness-agent/",
    status: "learning",
  },
  {
    id: "p16",
    week: "W5",
    category: "engineering",
    title: "MCP / 工具契约",
    standard: "OpenAPI、stdio server",
    course: "part07、part17",
    code: "mcp-tool-server/",
    status: "done",
  },
  {
    id: "p17",
    week: "W5",
    category: "eval",
    title: "测试闭环",
    standard: "单测、eval、E2E 思路",
    course: "part13 + shuang-chain",
    code: "tests/ unittest 81+",
    status: "learning",
  },
  {
    id: "p13",
    week: "W6",
    category: "deploy",
    title: "Docker 部署",
    standard: "compose、健康检查",
    course: "part12-agent-docker",
    code: "compose.yaml",
    status: "done",
  },
  {
    id: "p14",
    week: "W6",
    category: "agent",
    title: "上下文 / Memory",
    standard: "session、压缩策略",
    course: "part08、part09",
    code: "session.py",
    status: "learning",
  },
  {
    id: "p18",
    week: "W6",
    category: "deploy",
    title: "公网 HTTPS 部署",
    standard: "云服务器、域名、CORS",
    course: "part12",
    code: "⏸ 最后阶段",
    status: "todo",
  },
] as const;

/** 每周有序学习步骤 — 按执行顺序 */
export const LEARNING_STEPS = [
  // W1
  {
    id: "w1s1",
    week: "W1" as WeekId,
    order: 1,
    category: "rag" as CategoryId,
    title: "读 part05 Part1：RAG 架构总览",
    action: "理解四大局限、六大组件、两条数据流",
    course: "agent/part05-agent-rag/Part 1",
    code: null,
    deliverable: "能口述 RAG 是什么、为什么需要",
  },
  {
    id: "w1s2",
    week: "W1",
    order: 2,
    category: "rag",
    title: "读 part05 Part5：检索与混合召回",
    action: "向量 vs BM25、RRF 融合、精排流程",
    course: "agent/part05-agent-rag/Part 5",
    code: "retrieval.py",
    deliverable: "能讲混合检索原理",
  },
  {
    id: "w1s3",
    week: "W1",
    order: 3,
    category: "eval",
    title: "读 part13：Agent 评估七维度",
    action: "任务结果、工具动作、过程轨迹…",
    course: "agent/part13-agent-score",
    code: "agent-eval-dashboard/",
    deliverable: "能对应 eval 指标含义",
  },
  {
    id: "w1s4",
    week: "W1",
    order: 4,
    category: "rag",
    title: "对照代码：向量库 + 切分",
    action: "打开 vector_store.py、chunking.py 对照笔记",
    course: null,
    code: "vector_store.py、document_parser.py",
    deliverable: "笔记写入 learn-hub",
  },
  {
    id: "w1s5",
    week: "W1",
    order: 5,
    category: "eval",
    title: "跑 eval 回归",
    action: "agent-eval-dashboard 跑 latest 报告",
    course: null,
    code: "portfolio/agent-eval-dashboard/",
    deliverable: "eval 全绿或记录失败项",
  },
  {
    id: "w1s6",
    week: "W1",
    order: 6,
    category: "engineering",
    title: "Harness：hstack init",
    action: "在 harness-agent 创建第一个 side project run",
    course: "part19-agent-harness",
    code: "harness-agent/",
    deliverable: "有 run-id，research 阶段目录已生成",
  },
  // W2
  {
    id: "w2s1",
    week: "W2",
    order: 1,
    category: "rag",
    title: "读 part22 案例11：文档审核 Agent",
    action: "对照 Claim-Evidence 思路",
    course: "agent/part22-agent-workspace/案例11",
    code: null,
    deliverable: "能讲案例11 → verified_knowledge 映射",
  },
  {
    id: "w2s2",
    week: "W2",
    order: 2,
    category: "rag",
    title: "读 docs/20-case11 对照文档",
    action: "面试地图 + pending_review 流程",
    course: null,
    code: "work/ai-agent/docs/20-case11-*.md",
    deliverable: "能画查证门控流程图",
  },
  {
    id: "w2s3",
    week: "W2",
    order: 3,
    category: "portfolio",
    title: "深读 verified_knowledge.py",
    action: "Claim 抽取、对齐分、VerificationReport",
    course: null,
    code: "verified_knowledge.py",
    deliverable: "笔记 + 3 道面试题",
  },
  {
    id: "w2s4",
    week: "W2",
    order: 4,
    category: "engineering",
    title: "Harness：research + prototype gate",
    action: "hstack gate + advance 两阶段",
    course: "part19",
    code: "harness-agent/",
    deliverable: "两阶段产物已填、gate 通过",
  },
  // W3
  {
    id: "w3s1",
    week: "W3",
    order: 1,
    category: "agent",
    title: "读 part04：LangGraph 官方",
    action: "StateGraph、节点、边、checkpoint",
    course: "agent/part04-agent-langchain",
    code: null,
    deliverable: "能对比官方 vs 自研状态机",
  },
  {
    id: "w3s2",
    week: "W3",
    order: 2,
    category: "agent",
    title: "写/读 ADR 0002 LangGraph",
    action: "迁移决策、trade-off",
    course: null,
    code: "docs/decisions/0002-langgraph.md",
    deliverable: "ADR 能面试讲 3 分钟",
  },
  {
    id: "w3s3",
    week: "W3",
    order: 3,
    category: "agent",
    title: "对照 graph_orchestrator.py",
    action: "safety → retrieve → tools → compose",
    course: null,
    code: "graph_orchestrator.py",
    deliverable: "能画状态机图",
  },
  {
    id: "w3s4",
    week: "W3",
    order: 4,
    category: "engineering",
    title: "Harness：architecture + solution",
    action: "完成架构与方案阶段 gate",
    course: "part19",
    code: "harness-agent/",
    deliverable: "architecture、solution 产物完成",
  },
  // W4
  {
    id: "w4s1",
    week: "W4",
    order: 1,
    category: "agent",
    title: "读 part22 案例4：DeepResearch",
    action: "子问题规划、外网搜索、脚注报告",
    course: "agent/part22-agent-workspace",
    code: "deep_research.py",
    deliverable: "能 demo /deep-research/run",
  },
  {
    id: "w4s2",
    week: "W4",
    order: 2,
    category: "agent",
    title: "读 part14：Supervisor 多 Agent",
    action: "九阶段 Forge 编排逻辑",
    course: "agent/part14-agent-help",
    code: "forge_supervisor.py",
    deliverable: "能讲 Supervisor 分工",
  },
  {
    id: "w4s3",
    week: "W4",
    order: 3,
    category: "portfolio",
    title: "ProjectForge 第二轮 demo",
    action: "Web 工作台走一遍九阶段",
    course: null,
    code: "project_forge.py、agent-web/",
    deliverable: "demo 脚本熟练",
  },
  {
    id: "w4s4",
    week: "W4",
    order: 4,
    category: "engineering",
    title: "Harness：prd + development",
    action: "完成 PRD 与开发阶段",
    course: "part19",
    code: "harness-agent/",
    deliverable: "prd、development gate 通过",
  },
  // W5
  {
    id: "w5s1",
    week: "W5",
    order: 1,
    category: "engineering",
    title: "读 part19：Harness 阶段门",
    action: "hstack 命令、产物模板、brief",
    course: "agent/part19-agent-harness",
    code: "harness-agent/README.md",
    deliverable: "能解释 Harness vs ProjectForge 分工",
  },
  {
    id: "w5s2",
    week: "W5",
    order: 2,
    category: "engineering",
    title: "hstack 跑完 ①～⑦ 阶段",
    action: "side project 全链路推进",
    course: "part24",
    code: "harness-agent/",
    deliverable: "development 阶段完成",
  },
  {
    id: "w5s3",
    week: "W5",
    order: 3,
    category: "engineering",
    title: "MCP 工具契约（复习）",
    action: "part07 + mcp-tool-server 对照",
    course: "part07-agent-skills",
    code: "mcp-tool-server/",
    deliverable: "能讲 MCP vs HTTP 工具",
  },
  {
    id: "w5s4",
    week: "W5",
    order: 4,
    category: "eval",
    title: "测试产物模板 + unittest 保持绿",
    action: "81+ 单测 + eval 回归",
    course: "shuang-chain",
    code: "portfolio/agent-platform/tests/",
    deliverable: "测试全绿截图/日志",
  },
  // W6
  {
    id: "w6s1",
    week: "W6",
    order: 1,
    category: "deploy",
    title: "读 part12：Docker 部署",
    action: "compose、健康检查、依赖顺序",
    course: "agent/part12-agent-docker",
    code: "compose.yaml",
    deliverable: "本地 docker compose up 成功",
  },
  {
    id: "w6s2",
    week: "W6",
    order: 2,
    category: "agent",
    title: "Memory / Session 加深",
    action: "part08、part09 + session.py",
    course: "part08-agent-memory",
    code: "session.py",
    deliverable: "能讲多轮会话设计",
  },
  {
    id: "w6s3",
    week: "W6",
    order: 3,
    category: "eval",
    title: "周复盘 + 技能差距",
    action: "logs/weekly + T05 模板",
    course: null,
    code: "docs/templates/T05-skills-gap-review.md",
    deliverable: "本周 3 项优先补强",
  },
  {
    id: "w6s4",
    week: "W6",
    order: 4,
    category: "engineering",
    title: "Harness ⑧～⑨ + retro",
    action: "部署、复盘阶段全链路",
    course: "part19",
    code: "harness-agent/",
    deliverable: "第一个 side project 完整 retro",
  },
] as const;

/** 忙时每日 45min 最小包（§8.3） */
export const DAILY_MINIMUM: Record<
  number,
  { day: string; focus: string; course: string; action: string }
> = {
  1: {
    day: "周一",
    focus: "RAG 八股",
    course: "part05 一节",
    action: "复述 citation/拒答",
  },
  2: {
    day: "周二",
    focus: "查证",
    course: "案例11 notebook 30min",
    action: "verified_knowledge 代码 15min",
  },
  3: {
    day: "周三",
    focus: "Eval",
    course: "part13 一节",
    action: "看 latest eval 报告",
  },
  4: {
    day: "周四",
    focus: "FastAPI",
    course: "part10 一节",
    action: "curl 打 /ask",
  },
  5: {
    day: "周五",
    focus: "ProjectForge",
    course: "part14 一节",
    action: "Web 工作台点一遍",
  },
  6: {
    day: "周六",
    focus: "Harness",
    course: "part19 或 hstack brief",
    action: "写 1 个 stage 产物",
  },
  0: {
    day: "周日",
    focus: "周复盘",
    course: "对照 §8.1 知识点",
    action: "logs/weekly 打勾",
  },
};

/** 暂缓学习的课程（不必现在啃） */
export const DEFERRED_COURSES = [
  { part: "part02", name: "本地大模型", reason: "非求职主线" },
  { part: "part15-21", name: "OpenClaw 深水", reason: "入职后再学" },
  { part: "part18", name: "DeepSeek OCR", reason: "多模态加分项" },
  { part: "训练/微调", name: "模型训练", reason: "不投算法岗" },
];

export function getCurrentWeek(
  topics: { week: string; status: string }[]
): WeekId {
  const weeks: WeekId[] = ["W1", "W2", "W3", "W4", "W5", "W6"];
  for (const week of weeks) {
    const weekTopics = topics.filter((t) => t.week === week);
    if (weekTopics.some((t) => t.status !== "done")) return week;
  }
  return "W6";
}

export function getCategoryLabel(id: CategoryId): string {
  return CATEGORIES[id]?.label ?? id;
}
