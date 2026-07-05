# 部署说明

```bash
cd work/ai-agent
docker compose up --build
```

- Web: http://127.0.0.1:3000 → ProjectForge 工作台
- API: http://127.0.0.1:8000/docs

## 健康检查
`GET /health` → `{"status":"ok"}`
