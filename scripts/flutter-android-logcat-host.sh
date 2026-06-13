#!/usr/bin/env bash
set -euo pipefail

if ! command -v adb >/dev/null 2>&1; then
  echo "adb not found. Install with: brew install android-platform-tools"
  exit 1
fi

adb logcat | grep -iE 'flutter|greenly|dart|androidruntime'
