# Flutter Android Docker Workflow

## Base API URL

Use only one environment variable:

```env
API_URL=http://192.168.18.141/api
```

Derived Flutter endpoints:

```text
Core API    = API_URL/core
Catalog API = API_URL/catalog
ML API      = API_URL/ml
```

For physical Android device, do not use `localhost`.

## Start Backend

```bash
docker compose up --watch --build
```

## Build Flutter Android Image

```bash
docker compose --profile android build flutter-android-build
```

## Doctor

```bash
./scripts/flutter-android-doctor.sh
```

## Analyze

```bash
./scripts/flutter-android-analyze.sh
```

## Test

```bash
./scripts/flutter-android-test.sh
```

## Build Debug APK

```bash
source .env
./scripts/flutter-android-build-debug.sh
```

APK output:

```text
apps/app/build/app/outputs/flutter-apk/app-debug.apk
```

## Build Release APK

```bash
source .env
./scripts/flutter-android-build-release.sh
```

## Build Release AAB

```bash
source .env
./scripts/flutter-android-build-aab.sh
```

## Install APK to Android Phone from Mac Host

```bash
brew install android-platform-tools
adb devices
./scripts/flutter-android-install-host.sh
```

## Logcat

```bash
./scripts/flutter-android-logcat-host.sh
```

## Hot Reload via ADB Wi-Fi

Set:

```env
API_URL=http://192.168.18.141/api
ADB_DEVICE=192.168.18.xxx:5555
```

Run:

```bash
source .env
./scripts/flutter-android-dev-wifi.sh
```

When Flutter run is active:

```text
r = hot reload
R = hot restart
q = quit
```

## Backend Watch Notes

- `core-service` has Compose Watch sync, but `Dockerfile.dev` currently runs `pnpm run start`; file sync will not auto-reload unless the command uses `start:dev`.
- `catalog-service` has Compose Watch sync and runs `go run ./cmd/api`; file sync will not restart the process by itself. Add `air` later if Go hot reload is required.
- `ml-engine` has Compose Watch sync, but `Dockerfile.dev` runs uvicorn without `--reload`; file sync may not reload the process.

## Notes

- Docker Compose Watch syncs files into the container.
- Flutter hot reload requires active `flutter run`.
- `flutter build apk` is not hot reload.
- For Mac Intel, direct USB passthrough to Docker is not the default workflow.
- Use host adb install or ADB Wi-Fi.
