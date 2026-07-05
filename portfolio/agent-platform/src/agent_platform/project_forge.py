from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path

from agent_platform.deep_research import run_deep_research
from agent_platform.forge_context import inject_prior_context
from agent_platform.llm import OpenAICompatibleChatClient
from agent_platform.web_search import WebSearchClient
from agent_platform.verified_knowledge import VerificationReport, verify_text
from agent_platform.knowledge_base import KnowledgeBase


class ForgeStageId(str, Enum):
    RESEARCH = "research"
    PROTOTYPE = "prototype"
    ARCHITECTURE = "architecture"
    SOLUTION = "solution"
    PRD = "prd"
    DEVELOPMENT = "development"
    TESTING = "testing"
    DEPLOYMENT = "deployment"
    RETROSPECTIVE = "retrospective"


STAGE_ORDER: list[ForgeStageId] = [
    ForgeStageId.RESEARCH,
    ForgeStageId.PROTOTYPE,
    ForgeStageId.ARCHITECTURE,
    ForgeStageId.SOLUTION,
    ForgeStageId.PRD,
    ForgeStageId.DEVELOPMENT,
    ForgeStageId.TESTING,
    ForgeStageId.DEPLOYMENT,
    ForgeStageId.RETROSPECTIVE,
]

STAGE_LABELS: dict[ForgeStageId, str] = {
    ForgeStageId.RESEARCH: "① 需求调研",
    ForgeStageId.PROTOTYPE: "② 画面原型",
    ForgeStageId.ARCHITECTURE: "③ 架构选项",
    ForgeStageId.SOLUTION: "④ 解决方案",
    ForgeStageId.PRD: "⑤ PRD 书写",
    ForgeStageId.DEVELOPMENT: "⑥ 代码开发",
    ForgeStageId.TESTING: "⑦ 测试",
    ForgeStageId.DEPLOYMENT: "⑧ 上线部署",
    ForgeStageId.RETROSPECTIVE: "⑨ 复盘",
}

STAGE_AGENTS: dict[ForgeStageId, str] = {
    ForgeStageId.RESEARCH: "DeepResearch Agent",
    ForgeStageId.PROTOTYPE: "UX Agent",
    ForgeStageId.ARCHITECTURE: "Architect Agent",
    ForgeStageId.SOLUTION: "Architect Agent",
    ForgeStageId.PRD: "PRD Agent",
    ForgeStageId.DEVELOPMENT: "Fullstack Dev Agent",
    ForgeStageId.TESTING: "QA Agent",
    ForgeStageId.DEPLOYMENT: "DevOps Agent",
    ForgeStageId.RETROSPECTIVE: "Supervisor",
}


@dataclass
class ForgeArtifact:
    stage_id: ForgeStageId
    title: str
    summary: str
    markdown: str
    engine: str
    status: str = "completed"
    verification: VerificationReport | None = None


@dataclass
class ProjectForgeRun:
    run_id: str
    idea: str
    stages: list[ForgeArtifact] = field(default_factory=list)
    current_stage: ForgeStageId = ForgeStageId.RESEARCH
    overall_status: str = "completed"
    deploy_url: str = "http://127.0.0.1:3000"
    repository: str = "github.com/SunnySLJ/ai-agent"
    parent_run_id: str | None = None


def _research_artifact(
    idea: str,
    knowledge_base: KnowledgeBase,
    *,
    llm_client: OpenAICompatibleChatClient | None = None,
    web_search_client: WebSearchClient | None = None,
    prior_context: str = "",
) -> ForgeArtifact:
    query = idea
    if prior_context.strip():
        query = f"{idea}\n\n参考上一轮决策：\n{prior_context[:800]}"
    report = run_deep_research(
        query,
        knowledge_base,
        llm_client=llm_client,
        web_search_client=web_search_client,
    )
    web_note = f"，其中外网 {report.web_source_count} 条" if report.web_source_count else ""
    return ForgeArtifact(
        stage_id=ForgeStageId.RESEARCH,
        title="需求调研报告",
        summary=(
            f"DeepResearch 完成 {len(report.sub_questions)} 个子问题，"
            f"引用 {len(report.sources)} 条来源{web_note}。"
        ),
        markdown=report.markdown,
        engine="deep_research",
    )


def _prototype_artifact(idea: str) -> ForgeArtifact:
    markdown = f"""# 画面原型说明

## 核心页面
1. **ProjectForge 工作台**：左侧九阶段进度，中间阶段产物，右侧查证面板。
2. **能力 Tab**：企业知识库 / 查证型知识库 / DeepResearch / 书籍公众号。

## 关键交互
- 输入产品想法 → 一键「运行演示链路」
- 架构/PRD 阶段展示 Claim-Evidence 对照表
- 部署阶段给出 docker compose 与健康检查地址

## 想法锚点
{idea}
"""
    return ForgeArtifact(
        stage_id=ForgeStageId.PROTOTYPE,
        title="工作台原型",
        summary="九阶段进度 + 产物预览 + 查证侧栏。",
        markdown=markdown,
        engine="ux_agent",
    )


def _architecture_artifact(idea: str, *, prior_context: str = "") -> ForgeArtifact:
    markdown = f"""# 架构选项对比

| 方案 | 优点 | 风险 | 结论 |
|---|---|---|---|
| A. 内嵌模块 | 复用现有 RAG/测试/部署 | 单体变复杂 | **推荐** |
| B. 独立微服务 | 边界清晰 | 运维成本高 | 二期 |
| C. 纯 Prompt 工作流 | 上线快 | 难保证代码质量 | 不选 |

## 推荐架构
- `verified_knowledge.py` 内嵌到 agent-platform
- `project_forge.py` 编排九阶段演示
- Next.js 工作台消费 REST API

## 想法
{idea}
"""
    return ForgeArtifact(
        stage_id=ForgeStageId.ARCHITECTURE,
        title="架构选型 ADR",
        summary="选定内嵌查证模块 + ProjectForge 编排器。",
        markdown=inject_prior_context(markdown, prior_context),
        engine="enterprise_kb",
    )


def _solution_artifact(idea: str, *, prior_context: str = "") -> ForgeArtifact:
    markdown = f"""# 解决方案定稿

## 模块边界
- **verified_knowledge**：Claim / Evidence / VerificationReport
- **project_forge**：九阶段 artifact 生成
- **api.py**：`/verified-knowledge/verify`、`/project-forge/demo`
- **agent-web**：`ProjectForgeWorkbench.tsx`

## 数据流
想法 → 阶段产物 →（架构/PRD）查证门 → 开发任务 → 测试 → compose 部署

## 目标
{idea}
"""
    return ForgeArtifact(
        stage_id=ForgeStageId.SOLUTION,
        title="解决方案与数据流",
        summary="查证模块 + 编排器 + API + Web 工作台。",
        markdown=inject_prior_context(markdown, prior_context),
        engine="verified_kb",
    )


def _prd_artifact(idea: str, *, prior_context: str = "") -> ForgeArtifact:
    markdown = f"""# PRD（Phase A）

## 后端
- `POST /verified-knowledge/verify`：输入 text + source_stage，返回 VerificationReport
- `POST /project-forge/demo`：输入 idea，返回九阶段 ProjectForgeRun

## 前端
- Tab「ProjectForge 工作台」
- 阶段卡片 + markdown 预览 + 查证结果表

## 验收标准
- [ ] 能抽取 claim 并返回 evidence 对齐
- [ ] 九阶段演示可一键跑通
- [ ] unittest 覆盖 verify 与 demo API

## 需求
{idea}
"""
    return ForgeArtifact(
        stage_id=ForgeStageId.PRD,
        title="前后端 PRD",
        summary="两条 API + 工作台 UI + 验收清单。",
        markdown=inject_prior_context(markdown, prior_context),
        engine="verified_kb",
    )


def _development_artifact(idea: str) -> ForgeArtifact:
    markdown = f"""# 开发任务包

## 已实现文件
- `verified_knowledge.py` — Claim-Evidence 数据结构 + 核验
- `project_forge.py` — 九阶段演示编排
- `ProjectForgeWorkbench.tsx` — 工作台 UI
- `docs/17-project-forge-master-plan.md` — 主计划

## 代码规范
- 复用现有 dataclass / FastAPI / unittest 风格
- 不引入无关依赖
- 每个模块配套测试

## 上下文
{idea}
"""
    return ForgeArtifact(
        stage_id=ForgeStageId.DEVELOPMENT,
        title="开发交付说明",
        summary="查证模块、编排器、API、Web 与文档已落地。",
        markdown=markdown,
        engine="dev_agent",
    )


def _testing_artifact(idea: str) -> ForgeArtifact:
    markdown = f"""# 测试计划

## 单测
- `test_verified_knowledge.py`：claim 抽取、对齐分、拒答门控
- `test_project_forge.py`：九阶段产物、demo API

## 集成
- `POST /project-forge/demo` 返回 9 个 stage
- `POST /verified-knowledge/verify` 在已入库文档上返回 citation

## 门禁
`python -m unittest discover -s tests -v`
"""
    return ForgeArtifact(
        stage_id=ForgeStageId.TESTING,
        title="测试与门禁",
        summary="verified + project_forge 单测，API 集成测。",
        markdown=markdown,
        engine="qa_agent",
    )


def _deployment_artifact() -> ForgeArtifact:
    markdown = """# 部署说明

```bash
cd work/ai-agent
docker compose up --build
```

- Web: http://127.0.0.1:3000 → ProjectForge 工作台
- API: http://127.0.0.1:8000/docs

## 健康检查
`GET /health` → `{"status":"ok"}`
"""
    return ForgeArtifact(
        stage_id=ForgeStageId.DEPLOYMENT,
        title="部署与访问地址",
        summary="docker compose 一键启动，Web 3000 / API 8000。",
        markdown=markdown,
        engine="devops_agent",
    )


def _retrospective_artifact(run: ProjectForgeRun) -> ForgeArtifact:
    verified_stages = [stage for stage in run.stages if stage.verification is not None]
    markdown = f"""# 复盘

## 本次运行
- run_id: `{run.run_id}`
- 阶段数: {len(run.stages)}
- 查证阶段: {len(verified_stages)}

## 亮点
- 用 meta 场景演示「项目造项目」
- 查证型知识库与九阶段编排已打通

## 下一步
1. 公网部署 + 演示录屏
2. DeepResearch 接入调研阶段
3. Dev Agent 与 Skill 打通真实代码生成
"""
    return ForgeArtifact(
        stage_id=ForgeStageId.RETROSPECTIVE,
        title="复盘与下一步",
        summary="Phase A 演示链路完成，进入部署与求职转化。",
        markdown=markdown,
        engine="supervisor",
    )


def _persist_artifacts(run: ProjectForgeRun, artifacts_dir: Path | None) -> None:
    if artifacts_dir is None:
        return
    run_dir = artifacts_dir / run.run_id
    run_dir.mkdir(parents=True, exist_ok=True)
    for stage in run.stages:
        filename = f"{stage.stage_id.value}.md"
        (run_dir / filename).write_text(stage.markdown, encoding="utf-8")
    (run_dir / "manifest.txt").write_text(
        "\n".join(stage.stage_id.value for stage in run.stages) + "\n",
        encoding="utf-8",
    )


def run_project_forge_demo(
    idea: str,
    knowledge_base: KnowledgeBase,
    *,
    llm_client: OpenAICompatibleChatClient | None = None,
    web_search_client: WebSearchClient | None = None,
    artifacts_dir: Path | None = None,
    prior_context: str = "",
    parent_run_id: str | None = None,
) -> ProjectForgeRun:
    run_id = str(uuid.uuid4())
    run = ProjectForgeRun(
        run_id=run_id,
        idea=idea.strip() or "完善 agent-platform 查证型知识库",
        parent_run_id=parent_run_id,
    )

    builders: list[ForgeArtifact] = [
        _research_artifact(
            run.idea,
            knowledge_base,
            llm_client=llm_client,
            web_search_client=web_search_client,
            prior_context=prior_context,
        ),
        _prototype_artifact(run.idea),
        _architecture_artifact(run.idea, prior_context=prior_context),
        _solution_artifact(run.idea, prior_context=prior_context),
        _prd_artifact(run.idea, prior_context=prior_context),
        _development_artifact(run.idea),
        _testing_artifact(run.idea),
        _deployment_artifact(),
    ]

    for artifact in builders:
        if artifact.stage_id in {
            ForgeStageId.ARCHITECTURE,
            ForgeStageId.SOLUTION,
            ForgeStageId.PRD,
        }:
            artifact.verification = verify_text(
                artifact.markdown,
                knowledge_base,
                source_stage=artifact.stage_id.value,
                llm_client=llm_client,
            )
        run.stages.append(artifact)

    run.stages.append(_retrospective_artifact(run))
    run.current_stage = ForgeStageId.RETROSPECTIVE
    _persist_artifacts(run, artifacts_dir)
    return run
