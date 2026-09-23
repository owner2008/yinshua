$projectRoot = Split-Path -Parent $PSScriptRoot
$nodePath = Join-Path $projectRoot ".tools\node"
$corepackPath = Join-Path $projectRoot ".tools\corepack"
$mysqlPath = Join-Path $projectRoot ".tools\mysql-8.4.11-winx64\bin"
$mariadbPath = Join-Path $projectRoot ".tools\mariadb\bin"

if (-not (Test-Path (Join-Path $nodePath "node.exe"))) {
  throw "Node runtime not found at $nodePath"
}

$databasePath = if (Test-Path $mysqlPath) { $mysqlPath } else { $mariadbPath }
$env:Path = "$nodePath;$databasePath;$env:Path"
$env:COREPACK_HOME = $corepackPath

Write-Host "Development environment ready."
Write-Host "node: $(node -v)"
Write-Host "npm:  $(npm -v)"
Write-Host "pnpm: $(pnpm -v)"
