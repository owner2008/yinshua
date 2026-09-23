$projectRoot = Split-Path -Parent $PSScriptRoot
$mysqlBase = Join-Path $projectRoot ".tools\mysql-8.4.11-winx64"
$mysqlExe = Join-Path $mysqlBase "bin\mysqld.exe"
$mysqlData = Join-Path $projectRoot ".tools\mysql-data"
$mariadbExe = Join-Path $projectRoot ".tools\mariadb\bin\mariadbd.exe"
$mariadbDefaults = Join-Path $projectRoot ".tools\mariadb\my.ini"
$logDir = Join-Path $projectRoot ".tools\logs"

New-Item -ItemType Directory -Force $logDir | Out-Null

$existing = Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue
if ($existing) {
  Write-Host "Database is already listening on port 3306."
  return
}

if ((Test-Path $mysqlExe) -and (Test-Path $mysqlData)) {
  $process = Start-Process -FilePath $mysqlExe `
    -ArgumentList "--basedir=$mysqlBase", "--datadir=$mysqlData", "--port=3306", "--bind-address=127.0.0.1", "--mysqlx=OFF", "--log-error=$(Join-Path $mysqlData 'mysql.err')" `
    -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru
  Write-Host "MySQL started. PID: $($process.Id)"
  return
}

if (-not (Test-Path $mariadbExe)) {
  throw "No local MySQL or MariaDB runtime found under .tools."
}

$process = Start-Process -FilePath $mariadbExe `
  -ArgumentList "--defaults-file=$mariadbDefaults", "--console" `
  -WorkingDirectory $projectRoot -WindowStyle Hidden `
  -RedirectStandardOutput (Join-Path $logDir "mysql.log") `
  -RedirectStandardError (Join-Path $logDir "mysql.err.log") -PassThru

Write-Host "MariaDB started. PID: $($process.Id)"
