#!/usr/bin/env bash
set -euo pipefail

: "${API_URL:?Set API_URL in .env or shell}"
: "${ADB_DEVICE:?Set ADB_DEVICE, example: 192.168.18.xxx:5555}"

docker compose --profile android up --watch flutter-android-dev
