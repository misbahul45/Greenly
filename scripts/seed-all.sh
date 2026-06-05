#!/usr/bin/env bash
set -euo pipefail

# Greenly Full Seed Script
# Runs catalog-service seed, core-service seed, then triggers ML index rebuild.
#
# Usage:
#   ./scripts/seed-all.sh [--ml-url <ml_api_url>]
#
# Environment variables (can be set in .env or passed directly):
#   ML_API_URL   Base URL for the ML engine  (default: http://localhost/api/ml)
#   CATALOG_DIR  Path to catalog-service      (default: services/catalog-service)
#   CORE_DIR     Path to core-service         (default: services/core-service)

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

ML_API_URL="${ML_API_URL:-http://localhost/api/ml}"
CATALOG_DIR="${CATALOG_DIR:-$ROOT_DIR/services/catalog-service}"
CORE_DIR="${CORE_DIR:-$ROOT_DIR/services/core-service}"

# ── Parse optional flags ──────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --ml-url) ML_API_URL="$2"; shift 2 ;;
    *) echo "Unknown argument: $1"; exit 1 ;;
  esac
done

log() { echo "[$(date '+%H:%M:%S')] $*"; }

# ── Load .env if present ──────────────────────────────────────────────────────
if [[ -f "$ROOT_DIR/.env" ]]; then
  log "Loading root .env"
  set -o allexport
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env"
  set +o allexport
fi

# ── 1. Catalog-service seed (Go) ──────────────────────────────────────────────
log "🌱 Running catalog-service seed..."
if [[ -f "$CATALOG_DIR/.env" ]]; then
  (cd "$CATALOG_DIR" && go run ./cmd/seed/...)
else
  log "  ⚠️  No .env in catalog-service — using environment variables"
  (cd "$CATALOG_DIR" && go run ./cmd/seed/...)
fi
log "✅ Catalog seed complete"

# ── 2. Core-service seed (TypeScript/Prisma) ─────────────────────────────────
log "🌱 Running core-service seed..."
(cd "$CORE_DIR" && npx prisma db seed)
log "✅ Core seed complete"

# ── 3. ML engine: rebuild FAISS index ────────────────────────────────────────
log "🤖 Triggering ML engine index rebuild at $ML_API_URL/products/rebuild-index ..."
HTTP_STATUS=$(curl -s -o /tmp/ml_rebuild_response.json -w "%{http_code}" \
  -X POST "$ML_API_URL/products/rebuild-index" \
  -H "Content-Type: application/json")

if [[ "$HTTP_STATUS" -eq 200 || "$HTTP_STATUS" -eq 201 || "$HTTP_STATUS" -eq 202 ]]; then
  log "✅ ML index rebuild triggered successfully (HTTP $HTTP_STATUS)"
  cat /tmp/ml_rebuild_response.json && echo
else
  log "⚠️  ML index rebuild returned HTTP $HTTP_STATUS — check if ml-engine is running"
  cat /tmp/ml_rebuild_response.json && echo
  log "   You can rebuild manually: POST $ML_API_URL/products/rebuild-index"
fi

log ""
log "🎉 All seeds completed!"
log "   ML index: $ML_API_URL/products/rebuild-index"
