import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class DockerArtifactsTest(unittest.TestCase):
    def test_python_dockerfile_runs_uvicorn_on_port_8000(self):
        dockerfile = ROOT / "portfolio/agent-platform/Dockerfile"

        content = dockerfile.read_text(encoding="utf-8")

        self.assertIn("EXPOSE 8000", content)
        self.assertIn("uvicorn", content)
        self.assertIn("agent_platform.api:app", content)

    def test_python_dockerfile_uses_pip_retry_settings(self):
        dockerfile = ROOT / "portfolio/agent-platform/Dockerfile"

        content = dockerfile.read_text(encoding="utf-8")

        self.assertIn("--timeout", content)
        self.assertIn("--retries", content)

    def test_compose_wires_python_agent_platform_and_qdrant(self):
        compose = ROOT / "compose.yaml"

        content = compose.read_text(encoding="utf-8")

        self.assertIn("agent-platform:", content)
        self.assertIn("qdrant:", content)
        self.assertIn("QDRANT_BASE_URL=http://qdrant:6333", content)
        self.assertIn('"8000:8000"', content)
        self.assertNotIn("java-business-tool-service:", content)
        self.assertNotIn("JAVA_TOOL_BASE_URL", content)
        self.assertIn("depends_on:", content)
        self.assertIn("condition: service_healthy", content)
        self.assertIn("healthcheck:", content)

    def test_compose_wires_python_to_qdrant_vector_database(self):
        compose = ROOT / "compose.yaml"

        content = compose.read_text(encoding="utf-8")

        self.assertIn("qdrant:", content)
        self.assertIn("qdrant/qdrant", content)
        self.assertIn("QDRANT_BASE_URL=http://qdrant:6333", content)
        self.assertIn("QDRANT_COLLECTION=agent_docs", content)
        self.assertIn('"6333:6333"', content)
        self.assertIn("qdrant:\n        condition: service_started", content)

    def test_compose_includes_agent_web_frontend(self):
        compose = ROOT / "compose.yaml"
        dockerfile = ROOT / "portfolio/agent-web/Dockerfile"

        content = compose.read_text(encoding="utf-8")

        self.assertTrue(dockerfile.exists())
        self.assertIn("agent-web:", content)
        self.assertIn('"3000:3000"', content)
        self.assertIn("NEXT_PUBLIC_API_BASE_URL", content)
        self.assertIn("CORS_ALLOW_ORIGINS", content)

    def test_dockerignore_files_exclude_build_artifacts(self):
        python_ignore = (ROOT / "portfolio/agent-platform/.dockerignore").read_text(
            encoding="utf-8"
        )

        self.assertIn(".venv", python_ignore)
        self.assertIn("__pycache__", python_ignore)


if __name__ == "__main__":
    unittest.main()
