$projectRoot = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $projectRoot ".tools\logs"

. (Join-Path $PSScriptRoot "dev-env.ps1")
. (Join-Path $PSScriptRoot "start-mysql.ps1")

New-Item -ItemType Directory -Force $logDir | Out-Null

function Test-PortListening {
  param(
    [Parameter(Mandatory = $true)]
    [int]$Port
  )

  return [bool](Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Start-DevService {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [Parameter(Mandatory = $true)]
    [int]$Port,
    [Parameter(Mandatory = $true)]
    [string]$Command
  )

  if (Test-PortListening -Port $Port) {
    Write-Host "$Name is already listening on 127.0.0.1:$Port."
    return
  }

  $script = @"
Set-Location '$projectRoot'
. .\scripts\dev-env.ps1
$Command
"@

  $outLog = Join-Path $logDir "$Name.out.log"
  $errLog = Join-Path $logDir "$Name.err.log"

  Start-Process -FilePath "powershell.exe" `
    -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $script `
    -RedirectStandardOutput $outLog `
    -RedirectStandardError $errLog | Out-Null

  Write-Host "Started $Name. Opening on 127.0.0.1:$Port..."
}

Start-DevService -Name "api" -Port 3000 -Command "pnpm --dir apps/api start:dev"
Start-DevService -Name "admin" -Port 5173 -Command "pnpm --dir apps/admin dev"
Start-DevService -Name "client" -Port 5174 -Command "pnpm --dir apps/client dev"

Write-Host ""
Write-Host "Startup commands sent."
Write-Host "API:    http://127.0.0.1:3000/api"
Write-Host "Admin:  http://127.0.0.1:5173"
Write-Host "Client: http://127.0.0.1:5174"
