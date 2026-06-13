#!/usr/bin/env bash
set -euo pipefail

APK_PATH="${1:-apps/app/build/app/outputs/flutter-apk/app-debug.apk}"

if ! command -v adb >/dev/null 2>&1; then
  echo "adb not found. Install with: brew install android-platform-tools"
  exit 1
fi

adb devices
adb install -r "$APK_PATH"
