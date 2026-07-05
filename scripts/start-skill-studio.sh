#!/usr/bin/env bash
# 启动 Skill Studio（制作 / 演化 / 升级 skill 的 Web 界面）
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILL_REPO="${SHUANG_SKILL_ROOT:-$(cd "$ROOT/../../shuang-skill" 2>/dev/null && pwd || true)}"

if [[ -z "$SKILL_REPO" || ! -d "$SKILL_REPO/Skill-Distiller" ]]; then
  echo "❌ 未找到 shuang-skill 仓库（Skill-Distiller）"
  echo "   请设置环境变量 SHUANG_SKILL_ROOT 指向 shuang-skill 目录"
  echo "   例如: export SHUANG_SKILL_ROOT=/Users/mac/Desktop/shuang-kuai/shuang-skill"
  exit 1
fi

if [[ -z "${OPENROUTER_API_KEY:-}" ]]; then
  if [[ -n "${CODEX_API_KEY:-}" ]]; then
    export OPENROUTER_API_KEY="$CODEX_API_KEY"
  elif [[ -n "${OPENAI_API_KEY:-}" ]]; then
    export OPENROUTER_API_KEY="$OPENAI_API_KEY"
  else
    echo "⚠️  未设置 OPENROUTER_API_KEY / CODEX_API_KEY / OPENAI_API_KEY"
    echo "   Skill Studio 生成 skill 需要 API Key，例如："
    echo "   export OPENROUTER_API_KEY=\"\$CODEX_API_KEY\" && ./start-skill-studio.sh"
    exit 1
  fi
fi

export OPENROUTER_BASE_URL="${OPENROUTER_BASE_URL:-http://127.0.0.1:8317/api/provider/codex/v1}"
export OPENROUTER_MODEL="${OPENROUTER_MODEL:-gpt-5.5}"

echo "🛠️  Skill Studio → http://localhost:3270"
echo "   仓库: $SKILL_REPO"
echo "   模型: $OPENROUTER_MODEL"
echo ""
echo "   /library          本地 Skill 库"
echo "   /evolve/theater   Skill 演化剧场（升级 skill）"
echo ""

exec "$SKILL_REPO/start.sh"
