#!/usr/bin/env bash
set -euo pipefail

docker compose --profile android run --rm flutter-android-build flutter test
