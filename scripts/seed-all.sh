#!/usr/bin/env bash
set -euo pipefail

# Greenly Full Seed Script
# Runs catalog-service seed, core-service migrate+seed, then triggers ML index rebuild.
#
# Usage:
#   ./scripts/seed-all.sh
#   ./scripts/seed-all.sh --mode host
#   ./scripts/seed-all.sh --mode docker
#   ./scripts/seed-all.sh --ml-url http://localhost/api/ml
#   ./scripts/seed-all.sh --fail-on-ml-rebuild
#
# Mode:
#   host   = catalog seed from Mac host using localhost ports, core seed inside Docker
#   docker = catalog seed and core seed both inside Docker containers

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log() {
  echo "[$(date '+%H:%M:%S')] $*"
}

SEED_MODE="${SEED_MODE:-host}"

ROOT_ENV="$ROOT_DIR/.env"

if [[ -f "$ROOT_ENV" ]]; then
  log "Loading root .env: $ROOT_ENV"
  set -o allexport
  # shellcheck disable=SC1090
  source "$ROOT_ENV"
  set +o allexport
else
  log "⚠️  Root .env not found at $ROOT_ENV — using current shell environment/defaults"
fi

ML_API_URL="${ML_API_URL:-${ML_ENGINE_PUBLIC_URL:-http://localhost/api/ml}}"
ML_INTERNAL_TOKEN="${ML_INTERNAL_TOKEN:-greenly-local-ml-internal-token}"
FAIL_ON_ML_REBUILD="${FAIL_ON_ML_REBUILD:-false}"
CATALOG_DIR="${CATALOG_DIR:-$ROOT_DIR/services/catalog-service}"
CORE_DIR="${CORE_DIR:-$ROOT_DIR/services/core-service}"

if [[ "$CATALOG_DIR" != /* ]]; then
  CATALOG_DIR="$ROOT_DIR/$CATALOG_DIR"
fi

if [[ "$CORE_DIR" != /* ]]; then
  CORE_DIR="$ROOT_DIR/$CORE_DIR"
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    --ml-url)
      if [[ $# -lt 2 ]]; then
        echo "Missing value for --ml-url"
        exit 1
      fi
      ML_API_URL="$2"
      shift 2
      ;;
    --mode)
      if [[ $# -lt 2 ]]; then
        echo "Missing value for --mode"
        exit 1
      fi
      SEED_MODE="$2"
      shift 2
      ;;
    --fail-on-ml-rebuild)
      FAIL_ON_ML_REBUILD="true"
      shift
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

case "$SEED_MODE" in
  host|docker) ;;
  *)
    echo "Invalid --mode value: $SEED_MODE"
    echo "Allowed: host, docker"
    exit 1
    ;;
esac

if [[ ! -d "$CATALOG_DIR" ]]; then
  echo "Catalog service directory not found: $CATALOG_DIR"
  exit 1
fi

if [[ ! -d "$CORE_DIR" ]]; then
  echo "Core service directory not found: $CORE_DIR"
  exit 1
fi

log "🔎 Checking Docker services..."
docker compose -f "$ROOT_DIR/docker-compose.yml" ps >/dev/null

log "ℹ️  Make sure infra is up:"
log "   docker compose up -d mysql mongodb redis rabbitmq traefik core-service catalog-service ml-engine"

if [[ "$SEED_MODE" == "host" ]]; then
  log "Seed mode: host — catalog seed uses localhost, core seed uses Docker"

  MYSQL_PORT="${MYSQL_PORT:-3307}"
  MONGODB_PORT="${MONGODB_PORT:-27017}"
  REDIS_PORT="${REDIS_PORT:-6379}"
  RABBITMQ_PORT="${RABBITMQ_PORT:-5672}"

  MYSQL_USER="${MYSQL_USER:-greenly}"
  MYSQL_PASSWORD="${MYSQL_PASSWORD:-greenly}"
  MYSQL_DATABASE="${MYSQL_DATABASE:-greenly_core}"

  MONGO_INITDB_ROOT_USERNAME="${MONGO_INITDB_ROOT_USERNAME:-root}"
  MONGO_INITDB_ROOT_PASSWORD="${MONGO_INITDB_ROOT_PASSWORD:-root}"

  RABBITMQ_DEFAULT_USER="${RABBITMQ_DEFAULT_USER:-greenly}"
  RABBITMQ_DEFAULT_PASS="${RABBITMQ_DEFAULT_PASS:-greenly}"

  export DATABASE_HOST="127.0.0.1"
  export DATABASE_PORT="$MYSQL_PORT"
  export DATABASE_CONTAINER_PORT="$MYSQL_PORT"
  export DATABASE_URL="mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@127.0.0.1:${MYSQL_PORT}/${MYSQL_DATABASE}"

  export MONGODB_URL="mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@127.0.0.1:${MONGODB_PORT}/?authSource=admin"
  export MONGODB_URI="$MONGODB_URL"

  export REDIS_HOST="127.0.0.1"
  export REDIS_PORT="$REDIS_PORT"
  export REDIS_URL="redis://127.0.0.1:${REDIS_PORT}/0"

  export RABBITMQ_HOST="127.0.0.1"
  export RABBITMQ_PORT="$RABBITMQ_PORT"
  export RABBITMQ_URL="amqp://${RABBITMQ_DEFAULT_USER}:${RABBITMQ_DEFAULT_PASS}@127.0.0.1:${RABBITMQ_PORT}/"

  export CORE_SERVICE_URL="${CORE_SERVICE_PUBLIC_URL:-http://localhost/api/core}"
  export CATALOG_SERVICE_URL="${CATALOG_SERVICE_PUBLIC_URL:-http://localhost/api/catalog}"

  ML_API_URL="${ML_ENGINE_PUBLIC_URL:-$ML_API_URL}"
fi

log "Using:"
log "  ROOT_DIR=$ROOT_DIR"
log "  CATALOG_DIR=$CATALOG_DIR"
log "  CORE_DIR=$CORE_DIR"
log "  SEED_MODE=$SEED_MODE"
log "  ML_API_URL=$ML_API_URL"
log "  ML_INTERNAL_TOKEN is set: $([[ -n "$ML_INTERNAL_TOKEN" ]] && echo yes || echo no)"

if [[ "$SEED_MODE" == "host" ]]; then
  log "  Host MONGODB_URL is set: $([[ -n "$MONGODB_URL" ]] && echo yes || echo no)"
  log "  Host DATABASE_URL is set: $([[ -n "$DATABASE_URL" ]] && echo yes || echo no)"
  log "  Host RABBITMQ_URL is set: $([[ -n "$RABBITMQ_URL" ]] && echo yes || echo no)"
else
  log "  Docker mode uses container environment from docker-compose.yml"
fi

# ── 1. Core-service migration + seed inside Docker ────────────────────────────
log "🌱 Running core-service migration + seed inside Docker container..."

docker compose -f "$ROOT_DIR/docker-compose.yml" exec -T core-service sh -lc '
  test -n "$DATABASE_URL" && echo "DATABASE_URL is set"
  pnpm prisma migrate deploy
  pnpm prisma db seed
'

log "✅ Core migration + seed complete"

# ── 2. Catalog-service seed ───────────────────────────────────────────────────
if [[ "$SEED_MODE" == "docker" ]]; then
  log "🌱 Running catalog-service seed inside Docker container..."
  docker compose -f "$ROOT_DIR/docker-compose.yml" exec -T catalog-service sh -lc '
    go run ./cmd/seed/...
  '
else
  log "🌱 Running catalog-service seed from host..."
  (
    cd "$CATALOG_DIR"
    go run ./cmd/seed/...
  )
fi

log "✅ Catalog seed complete"

# ── 3. ML engine: rebuild FAISS index ─────────────────────────────────────────
REBUILD_URL="${ML_API_URL%/}/products/rebuild-index"
RESPONSE_FILE="$(mktemp)"

log "🤖 Triggering ML engine index rebuild at $REBUILD_URL ..."

HTTP_STATUS="$(curl -sS -o "$RESPONSE_FILE" -w "%{http_code}" \
  -X POST "$REBUILD_URL" \
  -H "Content-Type: application/json" \
  -H "X-Internal-Token: ${ML_INTERNAL_TOKEN}" || true)"

if [[ "$HTTP_STATUS" == "200" || "$HTTP_STATUS" == "201" || "$HTTP_STATUS" == "202" ]]; then
  log "✅ ML index rebuild triggered successfully (HTTP $HTTP_STATUS)"
  cat "$RESPONSE_FILE" && echo
else
  log "⚠️  ML index rebuild returned HTTP $HTTP_STATUS — check if ml-engine is running"
  cat "$RESPONSE_FILE" && echo
  log "   You can rebuild manually:"
  log "   curl -X POST $REBUILD_URL -H 'X-Internal-Token: \$ML_INTERNAL_TOKEN'"
  if [[ "$FAIL_ON_ML_REBUILD" == "true" ]]; then
    rm -f "$RESPONSE_FILE"
    exit 1
  fi
fi

rm -f "$RESPONSE_FILE"

log ""
log "🎉 All seeds completed!"
log "   ML index rebuild endpoint: $REBUILD_URL"
