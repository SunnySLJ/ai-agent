# 解决方案定稿

## 模块边界
- **verified_knowledge**：Claim / Evidence / VerificationReport
- **project_forge**：九阶段 artifact 生成
- **api.py**：`/verified-knowledge/verify`、`/project-forge/demo`
- **agent-web**：`ProjectForgeWorkbench.tsx`

## 数据流
想法 → 阶段产物 →（架构/PRD）查证门 → 开发任务 → 测试 → compose 部署

## 目标
第一轮 Forge 演示
