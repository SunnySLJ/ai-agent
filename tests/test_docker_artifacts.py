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

    def test_java_dockerfile_builds_and_runs_spring_boot_jar(self):
        dockerfile = ROOT / "portfolio/java-business-tool-service/Dockerfile"

        content = dockerfile.read_text(encoding="utf-8")

        self.assertIn("mvn", content)
        self.assertIn("EXPOSE 8080", content)
        self.assertIn("java", content)
        self.assertIn("-jar", content)

    def test_compose_wires_python_to_java_tool_service(self):
        compose = ROOT / "compose.yaml"

        content = compose.read_text(encoding="utf-8")

        self.assertIn("agent-platform:", content)
        self.assertIn("java-business-tool-service:", content)
        self.assertIn("JAVA_TOOL_BASE_URL=http://java-business-tool-service:8080", content)
        self.assertIn('"8000:8000"', content)
        self.assertIn('"8080:8080"', content)
        self.assertIn("depends_on:", content)
        self.assertIn("condition: service_healthy", content)
        self.assertIn("healthcheck:", content)

    def test_dockerignore_files_exclude_build_artifacts(self):
        python_ignore = (ROOT / "portfolio/agent-platform/.dockerignore").read_text(
            encoding="utf-8"
        )
        java_ignore = (
            ROOT / "portfolio/java-business-tool-service/.dockerignore"
        ).read_text(encoding="utf-8")

        self.assertIn(".venv", python_ignore)
        self.assertIn("__pycache__", python_ignore)
        self.assertIn("target", java_ignore)


if __name__ == "__main__":
    unittest.main()
