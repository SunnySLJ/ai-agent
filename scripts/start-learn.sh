#!/usr/bin/env bash
# 一键启动 AI 学习台（Next.js + SQLite）
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HUB="$ROOT/portfolio/learn-hub"
DATA_DIR="$ROOT/data"
DB="$DATA_DIR/learn.db"
SKILL_PID=""

cleanup() {
  if [[ -n "$SKILL_PID" ]] && kill -0 "$SKILL_PID" 2>/dev/null; then
    kill "$SKILL_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

export DATABASE_PATH="$DB"

SKIP_SEED=false
CLEAN=false
WITH_SKILLS=false
for arg in "$@"; do
  case "$arg" in
    --skip-seed) SKIP_SEED=true ;;
    --clean) CLEAN=true ;;
    --with-skills) WITH_SKILLS=true ;;
    -h|--help)
      echo "用法: $(basename "$0") [选项]"
      echo ""
      echo "  --skip-seed     跳过种子数据（日常重启更快）"
      echo "  --clean         清理 .next 后启动（代码更新后推荐）"
      echo "  --with-skills   同时启动 Skill Studio（:3270）"
      echo ""
      echo "启动后访问:"
      echo "  学习台    http://localhost:3001"
      echo "  Skill工坊 http://localhost:3001/skills"
      echo "  数据库    $DB"
      exit 0
      ;;
  esac
done

if ! command -v pnpm >/dev/null 2>&1; then
  echo "❌ 未找到 pnpm，请先安装: npm install -g pnpm"
  exit 1
fi

mkdir -p "$DATA_DIR"

cd "$HUB"

if [[ ! -d node_modules ]]; then
  echo "📦 安装依赖..."
  pnpm install
fi

if [[ "$CLEAN" == true ]] || [[ ! -f .next/BUILD_ID ]]; then
  if [[ -d .next ]]; then
    echo "🧹 清理旧构建（避免页面 500 / MODULE_NOT_FOUND）..."
    rm -rf .next
  fi
fi

echo "🗄️  迁移数据库..."
pnpm db:migrate

if [[ "$SKIP_SEED" == false ]]; then
  echo "🌱 写入种子数据..."
  pnpm seed
else
  echo "⏭️  跳过 seed（--skip-seed）"
fi

if [[ "$WITH_SKILLS" == true ]]; then
  echo "🛠️  启动 Skill Studio（后台 :3270）..."
  SKILL_REPO="${SHUANG_SKILL_ROOT:-$ROOT/../../shuang-skill}"
  if [[ -d "$SKILL_REPO/Skill-Distiller" ]]; then
    (
      cd "$SKILL_REPO/Skill-Distiller"
      export OPENROUTER_API_KEY="${OPENROUTER_API_KEY:-${CODEX_API_KEY:-${OPENAI_API_KEY:-}}}"
      export OPENROUTER_BASE_URL="${OPENROUTER_BASE_URL:-http://127.0.0.1:8317/api/provider/codex/v1}"
      pnpm dev
    ) >/tmp/learn-hub-skill-studio.log 2>&1 &
    SKILL_PID=$!
    sleep 5
    if kill -0 "$SKILL_PID" 2>/dev/null; then
      echo "   Skill Studio → http://localhost:3270"
    else
      echo "   ⚠️  Skill Studio 启动失败，见 /tmp/learn-hub-skill-studio.log"
      SKILL_PID=""
    fi
  else
    echo "   ⚠️  未找到 shuang-skill，跳过 Skill Studio"
  fi
fi

echo ""
echo "✅ 学习台 → http://localhost:3001"
echo "   Skill工坊 → http://localhost:3001/skills"
echo "   数据库 → $DB"
echo ""
echo "💡 若页面 500，请 Ctrl+C 后运行: ./start-learn.sh --clean --skip-seed"
echo ""

exec pnpm dev
