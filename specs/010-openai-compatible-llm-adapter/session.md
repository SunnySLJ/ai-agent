# 会话交接 · 010-openai-compatible-llm-adapter

## 上次做到哪

已完成 OpenAI-compatible LLM adapter feature：保留默认离线 deterministic Agent，同时在配置 `OPENAI_API_KEY` 等环境变量时允许 Python Agent Platform 调真实或本地兼容 chat completion API。

## 下次会话要做的事

1. 若用户提供有效 key，可做真实外部 smoke。
2. 若继续补工程深度，优先接 Qdrant/pgvector 和 rerank。

## 禁止重新规划

010 已收口。本 feature 不做 streaming、不接 embeddings、不引入 provider SDK、不保存真实密钥。
