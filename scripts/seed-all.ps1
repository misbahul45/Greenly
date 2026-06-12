# Greenly Full Seed Script - Windows PowerShell 5.1 / PowerShell 7 compatible

param(
    [ValidateSet("host", "docker")]
    [string]$Mode = $(if ($env:SEED_MODE) { $env:SEED_MODE } else { "host" }),

    [AllowEmptyString()]
    [string]$MlUrl = "",

    [switch]$FailOnMlRebuild
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

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
        [Parameter(Mandatory = $true)]
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
        [Parameter(Mandatory = $true)]
        [string]$Name,

        [AllowEmptyString()]
        [string]$Value
    )

    [Environment]::SetEnvironmentVariable($Name, $Value, "Process")
}

function Load-DotEnv {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        Log "Root .env not found at $Path - using current shell environment/defaults"
        return
    }

    Log "Loading root .env: $Path"

    Get-Content -LiteralPath $Path -Encoding UTF8 | ForEach-Object {
        $line = $_.Trim()

        if ([string]::IsNullOrWhiteSpace($line)) {
            return
        }

        if ($line.StartsWith("#")) {
            return
        }

        $idx = $line.IndexOf("=")

        if ($idx -lt 1) {
            return
        }

        $key = $line.Substring(0, $idx).Trim()
        $value = $line.Substring($idx + 1).Trim()

        if ([string]::IsNullOrWhiteSpace($key)) {
            return
        }

        if ($key.StartsWith("export ")) {
            $key = $key.Substring(7).Trim()
        }

        if (
            ($value.StartsWith('"') -and $value.EndsWith('"')) -or
            ($value.StartsWith("'") -and $value.EndsWith("'"))
        ) {
            if ($value.Length -ge 2) {
                $value = $value.Substring(1, $value.Length - 2)
            }
        }

        Set-EnvValue -Name $key -Value $value
    }
}

function Resolve-ServicePath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PathValue
    )

    if ([System.IO.Path]::IsPathRooted($PathValue)) {
        return $PathValue
    }

    return Join-Path $RootDir $PathValue
}

function Assert-CommandExists {
    param(
        [Parameter(Mandatory = $true)]
        [string]$CommandName
    )

    $command = Get-Command $CommandName -ErrorAction SilentlyContinue

    if (-not $command) {
        throw "Required command not found: $CommandName"
    }
}

function Invoke-ExternalCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath,

        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    & $FilePath @Arguments

    if ($LASTEXITCODE -ne 0) {
        throw "Command failed with exit code ${LASTEXITCODE}: $FilePath $($Arguments -join ' ')"
    }
}

function Invoke-MlRebuild {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Url,

        [Parameter(Mandatory = $true)]
        [string]$InternalToken
    )

    $headers = @{
        "Content-Type"     = "application/json"
        "X-Internal-Token" = $InternalToken
    }

    $requestParams = @{
        Uri             = $Url
        Method          = "POST"
        Headers         = $headers
        UseBasicParsing = $true
    }

    try {
        $response = Invoke-WebRequest @requestParams

        return @{
            StatusCode = [int]$response.StatusCode
            Body       = [string]$response.Content
            Error      = $null
        }
    } catch {
        $statusCode = 0
        $body = $_.Exception.Message
        $errResponse = $_.Exception.Response

        if ($errResponse) {
            try {
                $statusCode = [int]$errResponse.StatusCode
            } catch {
                $statusCode = 0
            }

            try {
                if ($errResponse.PSObject.Methods.Name -contains "GetResponseStream") {
                    # Windows PowerShell 5.1 (System.Net.WebException -> HttpWebResponse)
                    $stream = $errResponse.GetResponseStream()

                    if ($stream) {
                        $reader = New-Object System.IO.StreamReader($stream)
                        $body = $reader.ReadToEnd()
                        $reader.Close()
                    }
                } elseif ($errResponse.PSObject.Properties.Name -contains "Content") {
                    # PowerShell 7+ (HttpResponseException -> HttpResponseMessage)
                    $body = $errResponse.Content.ReadAsStringAsync().Result
                }
            } catch {
                $body = $_.Exception.Message
            }
        }

        return @{
            StatusCode = $statusCode
            Body       = $body
            Error      = $_
        }
    }
}

Assert-CommandExists -CommandName "docker"

$RootEnv = Join-Path $RootDir ".env"
Load-DotEnv -Path $RootEnv

if ([string]::IsNullOrWhiteSpace($MlUrl)) {
    $mlEnginePublicUrl = Get-EnvValue -Name "ML_ENGINE_PUBLIC_URL" -Default ""
    $mlApiUrlDefault = Get-EnvValue -Name "ML_API_URL" -Default "http://localhost/api/ml"

    if (-not [string]::IsNullOrWhiteSpace($mlEnginePublicUrl)) {
        $MlApiUrl = $mlEnginePublicUrl
    } else {
        $MlApiUrl = $mlApiUrlDefault
    }
} else {
    $MlApiUrl = $MlUrl
}

$MlInternalToken = Get-EnvValue -Name "ML_INTERNAL_TOKEN" -Default "greenly-local-ml-internal-token"

if ($FailOnMlRebuild.IsPresent) {
    $FailOnMlRebuildValue = "true"
} else {
    $FailOnMlRebuildValue = Get-EnvValue -Name "FAIL_ON_ML_REBUILD" -Default "false"
}

$CatalogDir = Get-EnvValue -Name "CATALOG_DIR" -Default (Join-Path $RootDir "services/catalog-service")
$CoreDir = Get-EnvValue -Name "CORE_DIR" -Default (Join-Path $RootDir "services/core-service")

$CatalogDir = Resolve-ServicePath -PathValue $CatalogDir
$CoreDir = Resolve-ServicePath -PathValue $CoreDir

if (-not (Test-Path -LiteralPath $CatalogDir)) {
    throw "Catalog service directory not found: $CatalogDir"
}

if (-not (Test-Path -LiteralPath $CoreDir)) {
    throw "Core service directory not found: $CoreDir"
}

$DockerComposeFile = Join-Path $RootDir "docker-compose.yml"

if (-not (Test-Path -LiteralPath $DockerComposeFile)) {
    throw "docker-compose.yml not found: $DockerComposeFile"
}

Log "Checking Docker services..."
Invoke-ExternalCommand -FilePath "docker" -Arguments @("compose", "-f", $DockerComposeFile, "ps")

Log "Make sure infra is up:"
Log "  docker compose up -d mysql mongodb redis rabbitmq traefik core-service catalog-service ml-engine"

if ($Mode -eq "host") {
    Log "Seed mode: host - catalog seed uses localhost, core seed uses Docker"

    $MysqlPort = Get-EnvValue -Name "MYSQL_PORT" -Default "3307"
    $MongodbPort = Get-EnvValue -Name "MONGODB_PORT" -Default "27017"
    $RedisPort = Get-EnvValue -Name "REDIS_PORT" -Default "6379"
    $RabbitmqPort = Get-EnvValue -Name "RABBITMQ_PORT" -Default "5672"

    $MysqlUser = Get-EnvValue -Name "MYSQL_USER" -Default "greenly"
    $MysqlPassword = Get-EnvValue -Name "MYSQL_PASSWORD" -Default "greenly"
    $MysqlDatabase = Get-EnvValue -Name "MYSQL_DATABASE" -Default "greenly_core"

    $MongoUser = Get-EnvValue -Name "MONGO_INITDB_ROOT_USERNAME" -Default "root"
    $MongoPassword = Get-EnvValue -Name "MONGO_INITDB_ROOT_PASSWORD" -Default "root"

    $RabbitUser = Get-EnvValue -Name "RABBITMQ_DEFAULT_USER" -Default "greenly"
    $RabbitPass = Get-EnvValue -Name "RABBITMQ_DEFAULT_PASS" -Default "greenly"

    Set-EnvValue -Name "DATABASE_HOST" -Value "127.0.0.1"
    Set-EnvValue -Name "DATABASE_PORT" -Value $MysqlPort
    Set-EnvValue -Name "DATABASE_CONTAINER_PORT" -Value $MysqlPort
    Set-EnvValue -Name "DATABASE_URL" -Value "mysql://${MysqlUser}:${MysqlPassword}@127.0.0.1:${MysqlPort}/${MysqlDatabase}"

    Set-EnvValue -Name "MONGODB_URL" -Value "mongodb://${MongoUser}:${MongoPassword}@127.0.0.1:${MongodbPort}/?authSource=admin"
    Set-EnvValue -Name "MONGODB_URI" -Value (Get-EnvValue -Name "MONGODB_URL")

    Set-EnvValue -Name "REDIS_HOST" -Value "127.0.0.1"
    Set-EnvValue -Name "REDIS_PORT" -Value $RedisPort
    Set-EnvValue -Name "REDIS_URL" -Value "redis://127.0.0.1:${RedisPort}/0"

    Set-EnvValue -Name "RABBITMQ_HOST" -Value "127.0.0.1"
    Set-EnvValue -Name "RABBITMQ_PORT" -Value $RabbitmqPort
    Set-EnvValue -Name "RABBITMQ_URL" -Value "amqp://${RabbitUser}:${RabbitPass}@127.0.0.1:${RabbitmqPort}/"

    $CoreServicePublicUrl = Get-EnvValue -Name "CORE_SERVICE_PUBLIC_URL" -Default "http://localhost/api/core"
    $CatalogServicePublicUrl = Get-EnvValue -Name "CATALOG_SERVICE_PUBLIC_URL" -Default "http://localhost/api/catalog"

    Set-EnvValue -Name "CORE_SERVICE_URL" -Value $CoreServicePublicUrl
    Set-EnvValue -Name "CATALOG_SERVICE_URL" -Value $CatalogServicePublicUrl

    $mlEnginePublicUrl = Get-EnvValue -Name "ML_ENGINE_PUBLIC_URL" -Default ""

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
    Log "  Host MONGODB_URL is set: $(if (-not [string]::IsNullOrWhiteSpace((Get-EnvValue -Name 'MONGODB_URL'))) { 'yes' } else { 'no' })"
    Log "  Host DATABASE_URL is set: $(if (-not [string]::IsNullOrWhiteSpace((Get-EnvValue -Name 'DATABASE_URL'))) { 'yes' } else { 'no' })"
    Log "  Host RABBITMQ_URL is set: $(if (-not [string]::IsNullOrWhiteSpace((Get-EnvValue -Name 'RABBITMQ_URL'))) { 'yes' } else { 'no' })"
} else {
    Log "  Docker mode uses container environment from docker-compose.yml"
}

Log "Running core-service migration + seed inside Docker container..."

$coreSeedCommand = 'test -n "$DATABASE_URL" && echo "DATABASE_URL is set"; pnpm prisma migrate deploy; pnpm prisma db seed'

Invoke-ExternalCommand -FilePath "docker" -Arguments @(
    "compose",
    "-f",
    $DockerComposeFile,
    "exec",
    "-T",
    "core-service",
    "sh",
    "-lc",
    $coreSeedCommand
)

Log "Core migration + seed complete"

if ($Mode -eq "docker") {
    Log "Running catalog-service seed inside Docker container..."

    $catalogSeedCommand = "go run ./cmd/seed/..."

    Invoke-ExternalCommand -FilePath "docker" -Arguments @(
        "compose",
        "-f",
        $DockerComposeFile,
        "exec",
        "-T",
        "catalog-service",
        "sh",
        "-lc",
        $catalogSeedCommand
    )
} else {
    Log "Running catalog-service seed from host..."

    Assert-CommandExists -CommandName "go"

    Push-Location $CatalogDir

    try {
        Invoke-ExternalCommand -FilePath "go" -Arguments @("run", "./cmd/seed/...")
    } finally {
        Pop-Location
    }
}

Log "Catalog seed complete"

$RebuildUrl = "$($MlApiUrl.TrimEnd('/'))/products/rebuild-index"

Log "Triggering ML engine index rebuild at $RebuildUrl ..."

$mlResult = Invoke-MlRebuild -Url $RebuildUrl -InternalToken $MlInternalToken
$httpStatus = [int]$mlResult.StatusCode
$body = [string]$mlResult.Body

if ($httpStatus -in @(200, 201, 202)) {
    Log "ML index rebuild triggered successfully (HTTP $httpStatus)"

    if (-not [string]::IsNullOrWhiteSpace($body)) {
        Write-Host $body
    }
} else {
    Log "ML index rebuild returned HTTP $httpStatus - check if ml-engine is running"

    if (-not [string]::IsNullOrWhiteSpace($body)) {
        Write-Host $body
    }

    Log "You can rebuild manually:"
    Log "curl -X POST $RebuildUrl -H 'X-Internal-Token: `$ML_INTERNAL_TOKEN'"

    if ($FailOnMlRebuildValue.ToLowerInvariant() -eq "true") {
        exit 1
    }
}

Log ""
Log "All seeds completed!"
Log "ML index rebuild endpoint: $RebuildUrl"