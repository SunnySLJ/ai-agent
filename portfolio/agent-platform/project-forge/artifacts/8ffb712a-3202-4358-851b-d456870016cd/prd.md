# PRD（Phase A）

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
为 agent-platform 增加查证型知识库与工作台
