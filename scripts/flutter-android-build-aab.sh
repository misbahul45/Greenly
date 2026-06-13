#!/usr/bin/env bash
set -euo pipefail

: "${API_URL:?Set API_URL in .env or shell}"

docker compose --profile android run --rm flutter-android-build \
  flutter build appbundle --release \
  --dart-define=API_URL="${API_URL}"
