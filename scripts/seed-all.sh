#!/usr/bin/env bash
set -euo pipefail

# Greenly Full Seed Script (Docker Mode Only)
# Runs catalog-service seed, core-service migrate+seed, then triggers ML index rebuild.
#
# Usage:
#   ./scripts/seed-all.sh
#   ./scripts/seed-all.sh --reset                  # Hapus DB dan migrasi ulang
#   ./scripts/seed-all.sh --ml-url http://localhost/api/ml
#   ./scripts/seed-all.sh --fail-on-ml-rebuild

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log() {
  echo "[$(date '+%H:%M:%S')] $*"
}

RESET_DB="false"

ROOT_ENV="$ROOT_DIR/.env"
if [[ -f "$ROOT_ENV" ]]; then
  log "Loading root .env: $ROOT_ENV"
  set -o allexport
  source "$ROOT_ENV"
  set +o allexport
else
  log "⚠️  Root .env not found at $ROOT_ENV — using current shell environment/defaults"
fi

ML_API_URL="${ML_API_URL:-${ML_ENGINE_PUBLIC_URL:-http://localhost/api/ml}}"
ML_INTERNAL_TOKEN="${ML_INTERNAL_TOKEN:-greenly-local-ml-internal-token}"
FAIL_ON_ML_REBUILD="${FAIL_ON_ML_REBUILD:-false}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --ml-url)
      ML_API_URL="$2"
      shift 2
      ;;
    --fail-on-ml-rebuild)
      FAIL_ON_ML_REBUILD="true"
      shift
      ;;
    --reset)
      RESET_DB="true"
      shift
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

log "Using:"
log "  ROOT_DIR=$ROOT_DIR"
log "  RESET_DB=$RESET_DB"
log "  ML_API_URL=$ML_API_URL"

# ── 1. Pastikan Docker Containers Aktif ───────────────────────────────────────
log "🔎 Memastikan service di dalam Docker sudah berjalan..."
docker compose -f "$ROOT_DIR/docker-compose.yml" up -d core-service catalog-service ml-engine

# Beri waktu jeda sedikit agar service benar-benar siap menerima command
sleep 3 

# ── 2. Core-service migration + seed inside Docker ────────────────────────────
log "🌱 Menjalankan core-service migration + seed di dalam container..."

if [[ "$RESET_DB" == "true" ]]; then
  log "⚠️  RESET MODE AKTIF: Menghapus database dan melakukan migrasi ulang..."
  docker compose -f "$ROOT_DIR/docker-compose.yml" exec -T core-service sh -lc '
    pnpm prisma migrate reset --force --skip-seed
    pnpm prisma db seed
  '
else
  docker compose -f "$ROOT_DIR/docker-compose.yml" exec -T core-service sh -lc '
    pnpm prisma migrate deploy
    pnpm prisma db seed
  '
fi

log "✅ Core migration + seed complete"

# ── 3. Catalog-service seed ─────────────────────────────────────
log "🌱 Menjalankan catalog-service seed di komputer lokal..."
cd "$ROOT_DIR/services/catalog-service" && go run ./cmd/seed/...
cd "$ROOT_DIR"
log "✅ Catalog seed complete"

# ── 4. ML engine: rebuild FAISS index ─────────────────────────────────────────
REBUILD_URL="${ML_API_URL%/}/products/rebuild-index"
RESPONSE_FILE="$(mktemp)"

log "🤖 Triggering ML engine index rebuild at $REBUILD_URL ..."

set +e
HTTP_STATUS="$(curl -sS -o "$RESPONSE_FILE" -w "%{http_code}" \
  -X POST "$REBUILD_URL" \
  -H "Content-Type: application/json" \
  -H "X-Internal-Token: ${ML_INTERNAL_TOKEN}")"
CURL_EXIT=$?
set -e

if [[ "$CURL_EXIT" -ne 0 ]]; then
  log "❌ ML index rebuild request failed before HTTP response (curl exit $CURL_EXIT)"
elif [[ "$HTTP_STATUS" == "200" || "$HTTP_STATUS" == "201" || "$HTTP_STATUS" == "202" ]]; then
  log "✅ ML index rebuild triggered successfully (HTTP $HTTP_STATUS)"
  cat "$RESPONSE_FILE" && echo
else
  log "⚠️  ML index rebuild endpoint returned HTTP $HTTP_STATUS"
  cat "$RESPONSE_FILE" && echo
  if [[ "$FAIL_ON_ML_REBUILD" == "true" ]]; then
    rm -f "$RESPONSE_FILE"
    exit 1
  fi
fi

rm -f "$RESPONSE_FILE"

log ""
log "🎉 All seeds completed dari dalam Docker!"