$projectRoot = Split-Path -Parent $PSScriptRoot
$mysqld = Join-Path $projectRoot ".tools\mariadb\bin\mariadbd.exe"
$defaultsFile = Join-Path $projectRoot ".tools\mariadb\my.ini"
$logDir = Join-Path $projectRoot ".tools\logs"

if (-not (Test-Path $mysqld)) {
  throw "MariaDB runtime not found at $mysqld"
}

New-Item -ItemType Directory -Force $logDir | Out-Null

$existing = Get-NetTCPConnection -LocalPort 3306 -ErrorAction SilentlyContinue
if ($existing) {
  Write-Host "MariaDB appears to be running on 127.0.0.1:3306."
  return
}

$process = Start-Process -FilePath $mysqld `
  -ArgumentList "--defaults-file=$defaultsFile", "--console" `
  -WorkingDirectory $projectRoot `
  -RedirectStandardOutput (Join-Path $logDir "mysql.log") `
  -RedirectStandardError (Join-Path $logDir "mysql.err.log") `
  -PassThru

Write-Host "MariaDB started. PID: $($process.Id)"
