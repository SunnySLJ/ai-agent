# 测试计划

## 单测
- `test_verified_knowledge.py`：claim 抽取、对齐分、拒答门控
- `test_project_forge.py`：九阶段产物、demo API

## 集成
- `POST /project-forge/demo` 返回 9 个 stage
- `POST /verified-knowledge/verify` 在已入库文档上返回 citation

## 门禁
`python -m unittest discover -s tests -v`
