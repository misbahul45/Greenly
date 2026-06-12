#!/usr/bin/env pwsh
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

<#
Greenly Full Seed Script - PowerShell Version

Usage:
  pwsh ./scripts/seed-all.ps1
  pwsh ./scripts/seed-all.ps1 -Mode host
  pwsh ./scripts/seed-all.ps1 -Mode docker
  pwsh ./scripts/seed-all.ps1 -MlUrl http://localhost/api/ml
  pwsh ./scripts/seed-all.ps1 -FailOnMlRebuild

Mode:
  host   = catalog seed from host using localhost ports, core seed inside Docker
  docker = catalog seed and core seed both inside Docker containers
#>

param(
  [ValidateSet("host", "docker")]
  [string]$Mode = $(if ($env:SEED_MODE) { $env:SEED_MODE } else { "host" }),

  [string]$MlUrl,

  [switch]$FailOnMlRebuild
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Resolve-Path (Join-Path $ScriptDir "..")
$RootDir = $RootDir.Path

function Log {
  param([string]$Message)
  $time = Get-Date -Format "HH:mm:ss"
  Write-Host "[$time] $Message"
}

function Get-EnvValue {
  param(
    [string]$Name,
    [string]$Default = ""
  )

  $value = [Environment]::GetEnvironmentVariable($Name, "Process")
  if ([string]::IsNullOrWhiteSpace($value)) {
    return $Default
  }

  return $value
}

function Set-EnvValue {
  param(
    [string]$Name,
    [string]$Value
  )

  [Environment]::SetEnvironmentVariable($Name, $Value, "Process")
}

function Load-DotEnv {
  param([string]$Path)

  if (-not (Test-Path $Path)) {
    Log "⚠️  Root .env not found at $Path — using current shell environment/defaults"
    return
  }

  Log "Loading root .env: $Path"

  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()

    if ([string]::IsNullOrWhiteSpace($line)) {
      return
    }

    if ($line.StartsWith("#")) {
      return
    }

    if ($line -notmatch "=") {
      return
    }

    $parts = $line -split "=", 2
    $key = $parts[0].Trim()
    $value = $parts[1].Trim()

    if ([string]::IsNullOrWhiteSpace($key)) {
      return
    }

    if (
      ($value.StartsWith('"') -and $value.EndsWith('"')) -or
      ($value.StartsWith("'") -and $value.EndsWith("'"))
    ) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    Set-EnvValue -Name $key -Value $value
  }
}

function Resolve-ServicePath {
  param([string]$PathValue)

  if ([System.IO.Path]::IsPathRooted($PathValue)) {
    return $PathValue
  }

  return Join-Path $RootDir $PathValue
}

$RootEnv = Join-Path $RootDir ".env"
Load-DotEnv -Path $RootEnv

if ([string]::IsNullOrWhiteSpace($MlUrl)) {
  $mlEnginePublicUrl = Get-EnvValue "ML_ENGINE_PUBLIC_URL" ""
  $mlApiUrlDefault = Get-EnvValue "ML_API_URL" "http://localhost/api/ml"

  if (-not [string]::IsNullOrWhiteSpace($mlEnginePublicUrl)) {
    $MlApiUrl = $mlEnginePublicUrl
  } else {
    $MlApiUrl = $mlApiUrlDefault
  }
} else {
  $MlApiUrl = $MlUrl
}

$MlInternalToken = Get-EnvValue "ML_INTERNAL_TOKEN" "greenly-local-ml-internal-token"

if ($FailOnMlRebuild.IsPresent) {
  $FailOnMlRebuildValue = "true"
} else {
  $FailOnMlRebuildValue = Get-EnvValue "FAIL_ON_ML_REBUILD" "false"
}

$CatalogDir = Get-EnvValue "CATALOG_DIR" (Join-Path $RootDir "services/catalog-service")
$CoreDir = Get-EnvValue "CORE_DIR" (Join-Path $RootDir "services/core-service")

$CatalogDir = Resolve-ServicePath $CatalogDir
$CoreDir = Resolve-ServicePath $CoreDir

if (-not (Test-Path $CatalogDir)) {
  throw "Catalog service directory not found: $CatalogDir"
}

if (-not (Test-Path $CoreDir)) {
  throw "Core service directory not found: $CoreDir"
}

$DockerComposeFile = Join-Path $RootDir "docker-compose.yml"

Log "🔎 Checking Docker services..."
docker compose -f $DockerComposeFile ps | Out-Null

Log "ℹ️  Make sure infra is up:"
Log "   docker compose up -d mysql mongodb redis rabbitmq traefik core-service catalog-service ml-engine"

if ($Mode -eq "host") {
  Log "Seed mode: host — catalog seed uses localhost, core seed uses Docker"

  $MysqlPort = Get-EnvValue "MYSQL_PORT" "3307"
  $MongodbPort = Get-EnvValue "MONGODB_PORT" "27017"
  $RedisPort = Get-EnvValue "REDIS_PORT" "6379"
  $RabbitmqPort = Get-EnvValue "RABBITMQ_PORT" "5672"

  $MysqlUser = Get-EnvValue "MYSQL_USER" "greenly"
  $MysqlPassword = Get-EnvValue "MYSQL_PASSWORD" "greenly"
  $MysqlDatabase = Get-EnvValue "MYSQL_DATABASE" "greenly_core"

  $MongoUser = Get-EnvValue "MONGO_INITDB_ROOT_USERNAME" "root"
  $MongoPassword = Get-EnvValue "MONGO_INITDB_ROOT_PASSWORD" "root"

  $RabbitUser = Get-EnvValue "RABBITMQ_DEFAULT_USER" "greenly"
  $RabbitPass = Get-EnvValue "RABBITMQ_DEFAULT_PASS" "greenly"

  Set-EnvValue "DATABASE_HOST" "127.0.0.1"
  Set-EnvValue "DATABASE_PORT" $MysqlPort
  Set-EnvValue "DATABASE_CONTAINER_PORT" $MysqlPort
  Set-EnvValue "DATABASE_URL" "mysql://${MysqlUser}:${MysqlPassword}@127.0.0.1:${MysqlPort}/${MysqlDatabase}"

  Set-EnvValue "MONGODB_URL" "mongodb://${MongoUser}:${MongoPassword}@127.0.0.1:${MongodbPort}/?authSource=admin"
  Set-EnvValue "MONGODB_URI" (Get-EnvValue "MONGODB_URL")

  Set-EnvValue "REDIS_HOST" "127.0.0.1"
  Set-EnvValue "REDIS_PORT" $RedisPort
  Set-EnvValue "REDIS_URL" "redis://127.0.0.1:${RedisPort}/0"

  Set-EnvValue "RABBITMQ_HOST" "127.0.0.1"
  Set-EnvValue "RABBITMQ_PORT" $RabbitmqPort
  Set-EnvValue "RABBITMQ_URL" "amqp://${RabbitUser}:${RabbitPass}@127.0.0.1:${RabbitmqPort}/"

  $CoreServicePublicUrl = Get-EnvValue "CORE_SERVICE_PUBLIC_URL" "http://localhost/api/core"
  $CatalogServicePublicUrl = Get-EnvValue "CATALOG_SERVICE_PUBLIC_URL" "http://localhost/api/catalog"

  Set-EnvValue "CORE_SERVICE_URL" $CoreServicePublicUrl
  Set-EnvValue "CATALOG_SERVICE_URL" $CatalogServicePublicUrl

  $mlEnginePublicUrl = Get-EnvValue "ML_ENGINE_PUBLIC_URL" ""
  if (-not [string]::IsNullOrWhiteSpace($mlEnginePublicUrl)) {
    $MlApiUrl = $mlEnginePublicUrl
  }
}

Log "Using:"
Log "  ROOT_DIR=$RootDir"
Log "  CATALOG_DIR=$CatalogDir"
Log "  CORE_DIR=$CoreDir"
Log "  SEED_MODE=$Mode"
Log "  ML_API_URL=$MlApiUrl"
Log "  ML_INTERNAL_TOKEN is set: $(if (-not [string]::IsNullOrWhiteSpace($MlInternalToken)) { 'yes' } else { 'no' })"

if ($Mode -eq "host") {
  Log "  Host MONGODB_URL is set: $(if (-not [string]::IsNullOrWhiteSpace((Get-EnvValue 'MONGODB_URL'))) { 'yes' } else { 'no' })"
  Log "  Host DATABASE_URL is set: $(if (-not [string]::IsNullOrWhiteSpace((Get-EnvValue 'DATABASE_URL'))) { 'yes' } else { 'no' })"
  Log "  Host RABBITMQ_URL is set: $(if (-not [string]::IsNullOrWhiteSpace((Get-EnvValue 'RABBITMQ_URL'))) { 'yes' } else { 'no' })"
} else {
  Log "  Docker mode uses container environment from docker-compose.yml"
}

# ── 1. Core-service migration + seed inside Docker ────────────────────────────
Log "🌱 Running core-service migration + seed inside Docker container..."

docker compose -f $DockerComposeFile exec -T core-service sh -lc @'
test -n "$DATABASE_URL" && echo "DATABASE_URL is set"
pnpm prisma migrate deploy
pnpm prisma db seed
'@

Log "✅ Core migration + seed complete"

# ── 2. Catalog-service seed ───────────────────────────────────────────────────
if ($Mode -eq "docker") {
  Log "🌱 Running catalog-service seed inside Docker container..."

  docker compose -f $DockerComposeFile exec -T catalog-service sh -lc @'
go run ./cmd/seed/...
'@
} else {
  Log "🌱 Running catalog-service seed from host..."

  Push-Location $CatalogDir
  try {
    go run ./cmd/seed/...
  } finally {
    Pop-Location
  }
}

Log "✅ Catalog seed complete"

# ── 3. ML engine: rebuild FAISS index ─────────────────────────────────────────
$RebuildUrl = "$($MlApiUrl.TrimEnd('/'))/products/rebuild-index"

Log "🤖 Triggering ML engine index rebuild at $RebuildUrl ..."

try {
  $headers = @{
    "Content-Type" = "application/json"
    "X-Internal-Token" = $MlInternalToken
  }

  $response = Invoke-WebRequest `
    -Uri $RebuildUrl `
    -Method POST `
    -Headers $headers `
    -UseBasicParsing `
    -SkipHttpErrorCheck

  $httpStatus = [int]$response.StatusCode
  $body = $response.Content
} catch {
  $httpStatus = 0
  $body = $_.Exception.Message
}

if ($httpStatus -in @(200, 201, 202)) {
  Log "✅ ML index rebuild triggered successfully (HTTP $httpStatus)"
  if ($body) {
    Write-Host $body
  }
} else {
  Log "⚠️  ML index rebuild returned HTTP $httpStatus — check if ml-engine is running"
  if ($body) {
    Write-Host $body
  }

  Log "   You can rebuild manually:"
  Log "   curl -X POST $RebuildUrl -H 'X-Internal-Token: `$ML_INTERNAL_TOKEN'"

  if ($FailOnMlRebuildValue -eq "true") {
    exit 1
  }
}

Log ""
Log "🎉 All seeds completed!"
Log "   ML index rebuild endpoint: $RebuildUrl"
