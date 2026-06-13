#!/usr/bin/env bash
set -euo pipefail

docker compose down

echo "Flutter-related volumes:"
docker volume ls | grep -E 'flutter|gradle|pub|android_sdk' || true

echo ""
echo "Remove manually if needed:"
echo "docker volume rm <project>_flutter_gradle_cache"
echo "docker volume rm <project>_flutter_pub_cache"
echo "docker volume rm <project>_flutter_android_sdk"
