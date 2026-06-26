# 会话交接 · 006-docker-compose-runtime

## 上次做到哪

已完成 Docker Compose runtime：Python Agent API 和 Java Business Tool Service 都有 Dockerfile，根目录 `compose.yaml` 通过 `JAVA_TOOL_BASE_URL` 把 Python Agent 接到 Java 工具服务。

## 下次会话要做的事

1. 若 Docker daemon 已启动，运行 `docker compose up --build` 并 smoke-test `/health` 与 `/ask`。
2. 继续下一个 feature，建议做评估仪表盘、失败回放或求职作品集演示脚本。

## 禁止重新规划

006 已收口。除非用户明确要求修改容器运行时，否则不要重开本 feature。
