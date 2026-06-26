# AI 行业资讯每日收集规则

## 目标

每天定时收集 AI 行业最新资讯，把外部变化转成这个项目的学习任务、作品集 backlog、岗位关键词和面试表达。资讯收集本身不是目的，能指导行动才算有效。

## 固定节奏

- 默认时间：每天北京时间上午。
- 输出路径：`logs/industry/YYYY-MM-DD.md`。
- 模板：`docs/templates/industry-news-log.md`。
- 手动运行：`python3 scripts/industry_watch.py --sources docs/industry-watch-sources.json --out-dir logs/industry`。
- 自动运行：`.github/workflows/industry-watch.yml` 每天 01:00 UTC 触发，对应北京时间 09:00。
- 周复盘：每周把 7 天资讯压缩成 3-5 条趋势判断，并更新 `docs/30-day-sprint.md`、`docs/portfolio-projects.md` 或面试材料。

## 关注范围

只记录和当前求职目标直接相关的内容：

- Agent/RAG：检索、重排、GraphRAG、Agentic RAG、Memory、Context Engineering。
- 模型 API：OpenAI-compatible API、国内模型 API、流式输出、结构化输出、Function Calling。
- 工具协议：MCP、OpenAPI tool contract、企业系统工具化。
- 工程化：FastAPI、Docker、观测、评估、成本控制、失败回放。
- Java 侧机会：Spring AI、Java 后端接入大模型、企业业务系统 AI 化。
- 岗位变化：杭州/国内 AI Agent、大模型应用、RAG、AI 平台后端岗位关键词。

## 推荐信息源类型

- 官方博客、官方文档、release notes。
- 开源项目 release、issue、discussion。
- 技术社区高质量长文。
- 招聘平台 JD 和岗位关键词变化。
- 论文或工程实践文章，但只记录能转化为项目行动的内容。

不要把无法复核的二手传闻写成确定事实。来源不稳定时，在日志里标注“待复核”。

## 每条资讯必须包含

- 来源名称和链接。
- 发布或抓取日期。
- 20-80 字摘要。
- 可信度：high / medium / low。
- 对本项目的影响：学习、代码、文档、求职、面试中的至少一类。
- 下一步动作：必须具体到文件、feature、练习题或岗位关键词。

## 转化规则

- 能提升作品集技术深度的，进入 `specs/` 或 `docs/portfolio-projects.md` backlog。
- 能提升岗位匹配的，更新 `docs/job-market-hangzhou.md` 或 BOSS 话术。
- 能提升面试表达的，更新 `docs/interview-kit.md`。
- 只是泛新闻、融资、营销口径，默认不进入项目。

## 完成口径

当前已经具备可运行脚本、来源配置、GitHub Actions 定时任务和本地运行日志。后续优化重点是提升来源稳定性、增加去重质量和每周趋势汇总，不把单个来源抓取失败视为整体失败；失败来源必须写入日志的“待复核”。
