# Feature 006: Docker Compose Runtime

## Why

The portfolio can run Python and Java separately, and Python can call Java over HTTP. To become a stronger interview demo, the project needs a reproducible local runtime that starts both services together and wires the Python Agent API to the Java Business Tool Service.

## Scope

Add Docker and Compose runtime support:

- Dockerfile for `portfolio/agent-platform`.
- Dockerfile for `portfolio/java-business-tool-service`.
- Root `compose.yaml` with `agent-platform` and `java-business-tool-service` services.
- Python API support for `JAVA_TOOL_BASE_URL`, so Compose mode uses Java-backed tools by default.
- Tests that verify Docker artifacts and API env wiring.
- README docs for build, config, and run commands.

## Out of Scope

- Publishing images to a registry.
- Kubernetes manifests.
- Database/vector database containers.
- Production TLS, auth, or secrets.

## Acceptance Criteria

### AC1: Python service can be containerized

Given `portfolio/agent-platform/Dockerfile`,
When the image is built,
Then it installs the package and starts `uvicorn agent_platform.api:app` on port `8000`.

### AC2: Java service can be containerized

Given `portfolio/java-business-tool-service/Dockerfile`,
When the image is built,
Then it creates a Spring Boot jar and starts it on port `8080`.

### AC3: Compose wires both services

Given root `compose.yaml`,
When `docker compose config` is run,
Then it defines `agent-platform` and `java-business-tool-service`, maps host ports, includes health checks, and sets `JAVA_TOOL_BASE_URL=http://java-business-tool-service:8080`.

### AC4: Python API uses Java tools in Compose mode

Given `JAVA_TOOL_BASE_URL` is set,
When `agent_platform.api.create_app()` is called without an explicit platform,
Then the API uses `AgentPlatform.with_java_tools(base_url)` instead of `offline_demo()`.

### AC5: Documentation explains local runtime

Given someone reads the root README,
When following Docker Compose instructions,
Then they can run config validation, start services, call health endpoints, and ask an order question.
