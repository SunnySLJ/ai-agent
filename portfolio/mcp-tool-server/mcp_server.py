from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any
from urllib import error, parse, request


ROOT = Path(__file__).resolve().parent
MANIFEST_PATH = ROOT / "mcp-tools.json"


class McpToolServer:
    def __init__(
        self,
        base_url: str,
        manifest_path: Path | None = None,
        timeout_seconds: float = 5,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._manifest_path = manifest_path or MANIFEST_PATH
        self._timeout_seconds = timeout_seconds
        self._manifest = self._load_manifest()

    def handle(self, message: dict[str, Any]) -> dict[str, Any]:
        method = message.get("method")
        request_id = message.get("id")
        if method == "initialize":
            return self._result(
                request_id,
                {
                    "protocolVersion": "2025-06-18",
                    "serverInfo": self._manifest["serverInfo"],
                    "capabilities": self._manifest["capabilities"],
                },
            )
        if method == "tools/list":
            return self._result(request_id, {"tools": self._manifest["tools"]})
        if method == "tools/call":
            params = message.get("params", {})
            return self._result(
                request_id,
                self._call_tool(
                    name=str(params.get("name", "")),
                    arguments=params.get("arguments", {}),
                ),
            )
        return self._error(request_id, -32601, f"Method not found: {method}")

    def _call_tool(self, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        tool = self._tool_by_name(name)
        if tool is None:
            raise ValueError(f"Unknown tool: {name}")

        status, payload = self._invoke_http(tool, arguments)
        if status >= 400:
            text = json.dumps(payload, ensure_ascii=False)
            return {
                "content": [{"type": "text", "text": text}],
                "isError": True,
            }
        text = payload.get("summary", json.dumps(payload, ensure_ascii=False))
        return {"content": [{"type": "text", "text": text}], "isError": False}

    def _invoke_http(
        self,
        tool: dict[str, Any],
        arguments: dict[str, Any],
    ) -> tuple[int, dict[str, Any]]:
        http = tool["http"]
        method = http["method"].upper()
        path = http["path"]
        for key, value in arguments.items():
            path = path.replace(f"{{{key}}}", parse.quote(str(value)))
        body = None
        headers = {"accept": "application/json"}
        if method == "POST":
            body = json.dumps(arguments).encode("utf-8")
            headers["content-type"] = "application/json"
        req = request.Request(
            f"{self._base_url}{path}",
            data=body,
            headers=headers,
            method=method,
        )
        try:
            with request.urlopen(req, timeout=self._timeout_seconds) as response:
                return response.status, self._decode_json(response.read())
        except error.HTTPError as exc:
            return exc.code, self._decode_json(exc.read())
        except (error.URLError, TimeoutError, OSError) as exc:
            return 599, {"code": "BUSINESS_TOOL_SERVICE_UNAVAILABLE", "message": str(exc)}

    def _tool_by_name(self, name: str) -> dict[str, Any] | None:
        for tool in self._manifest["tools"]:
            if tool["name"] == name:
                return tool
        return None

    def _load_manifest(self) -> dict[str, Any]:
        with self._manifest_path.open(encoding="utf-8") as file:
            return json.load(file)

    def _decode_json(self, body: bytes) -> dict[str, Any]:
        if not body:
            return {}
        decoded = json.loads(body.decode("utf-8"))
        return decoded if isinstance(decoded, dict) else {"value": decoded}

    def _result(self, request_id: Any, result: dict[str, Any]) -> dict[str, Any]:
        return {"jsonrpc": "2.0", "id": request_id, "result": result}

    def _error(self, request_id: Any, code: int, message: str) -> dict[str, Any]:
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "error": {"code": code, "message": message},
        }


def default_server() -> McpToolServer:
    base_url = os.environ.get("AGENT_PLATFORM_BASE_URL", "http://127.0.0.1:8000")
    return McpToolServer(base_url=base_url)


def serve_stdio() -> None:
    server = default_server()
    for line in os.sys.stdin:
        line = line.strip()
        if not line:
            continue
        message = json.loads(line)
        try:
            response = server.handle(message)
        except Exception as exc:  # noqa: BLE001 - stdio boundary
            response = {
                "jsonrpc": "2.0",
                "id": message.get("id"),
                "error": {"code": -32000, "message": str(exc)},
            }
        os.sys.stdout.write(json.dumps(response, ensure_ascii=False) + "\n")
        os.sys.stdout.flush()


if __name__ == "__main__":
    serve_stdio()
