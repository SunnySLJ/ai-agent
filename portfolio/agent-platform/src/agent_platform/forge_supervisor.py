from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from agent_platform.project_forge import ForgeStageId


class ForgeAgentKind(str, Enum):
    DEEP_RESEARCH = "deep_research"
    UX = "ux_agent"
    ARCHITECT = "architect_agent"
    VERIFIED = "verified_kb"
    DEV = "dev_agent"
    QA = "qa_agent"
    DEVOPS = "devops_agent"
    SUPERVISOR = "supervisor"


@dataclass(frozen=True)
class ForgeRoute:
    stage_id: str
    agent_name: str
    agent_kind: ForgeAgentKind
    requires_verification: bool


def _agent_kind_for(stage_id: "ForgeStageId") -> ForgeAgentKind:
    from agent_platform.project_forge import ForgeStageId

    mapping = {
        ForgeStageId.RESEARCH: ForgeAgentKind.DEEP_RESEARCH,
        ForgeStageId.PROTOTYPE: ForgeAgentKind.UX,
        ForgeStageId.ARCHITECTURE: ForgeAgentKind.ARCHITECT,
        ForgeStageId.SOLUTION: ForgeAgentKind.VERIFIED,
        ForgeStageId.PRD: ForgeAgentKind.VERIFIED,
        ForgeStageId.DEVELOPMENT: ForgeAgentKind.DEV,
        ForgeStageId.TESTING: ForgeAgentKind.QA,
        ForgeStageId.DEPLOYMENT: ForgeAgentKind.DEVOPS,
        ForgeStageId.RETROSPECTIVE: ForgeAgentKind.SUPERVISOR,
    }
    return mapping[stage_id]


def _verification_stages() -> set["ForgeStageId"]:
    from agent_platform.project_forge import ForgeStageId

    return {
        ForgeStageId.ARCHITECTURE,
        ForgeStageId.SOLUTION,
        ForgeStageId.PRD,
    }


def route_stage(stage_id: "ForgeStageId") -> ForgeRoute:
    from agent_platform.project_forge import STAGE_AGENTS

    return ForgeRoute(
        stage_id=stage_id.value,
        agent_name=STAGE_AGENTS[stage_id],
        agent_kind=_agent_kind_for(stage_id),
        requires_verification=stage_id in _verification_stages(),
    )


def supervisor_plan() -> list[ForgeRoute]:
    from agent_platform.project_forge import STAGE_ORDER

    return [route_stage(stage_id) for stage_id in STAGE_ORDER]
