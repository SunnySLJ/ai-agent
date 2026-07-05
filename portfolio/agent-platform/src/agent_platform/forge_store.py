from __future__ import annotations

from dataclasses import asdict
import json
from pathlib import Path
from typing import Any

from agent_platform.project_forge import ProjectForgeRun


class ForgeRunStore:
    def __init__(self, *, persist_path: Path | None = None) -> None:
        self._runs: dict[str, dict[str, Any]] = {}
        self._persist_path = persist_path

    def save(self, run: ProjectForgeRun) -> None:
        payload = self._run_to_dict(run)
        self._runs[run.run_id] = payload
        if self._persist_path is not None:
            self._persist_path.parent.mkdir(parents=True, exist_ok=True)
            self._persist_path.write_text(
                json.dumps(self._runs, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )

    def get(self, run_id: str) -> dict[str, Any] | None:
        return self._runs.get(run_id)

    def list_runs(self) -> list[dict[str, Any]]:
        return [
            {
                "run_id": run_id,
                "idea": payload.get("idea", ""),
                "overall_status": payload.get("overall_status", ""),
                "current_stage": payload.get("current_stage", ""),
                "parent_run_id": payload.get("parent_run_id"),
                "stage_count": len(payload.get("stages", [])),
            }
            for run_id, payload in sorted(self._runs.items(), reverse=True)
        ]

    def load_from_disk(self) -> None:
        if self._persist_path is None or not self._persist_path.exists():
            return
        payload = json.loads(self._persist_path.read_text(encoding="utf-8"))
        if isinstance(payload, dict):
            self._runs = payload

    @staticmethod
    def _run_to_dict(run: ProjectForgeRun) -> dict[str, Any]:
        return {
            "run_id": run.run_id,
            "idea": run.idea,
            "overall_status": run.overall_status,
            "current_stage": run.current_stage.value,
            "deploy_url": run.deploy_url,
            "repository": run.repository,
            "parent_run_id": run.parent_run_id,
            "stages": [
                {
                    "stage_id": stage.stage_id.value,
                    "title": stage.title,
                    "summary": stage.summary,
                    "markdown": stage.markdown,
                    "engine": stage.engine,
                    "status": stage.status,
                }
                for stage in run.stages
            ],
        }
