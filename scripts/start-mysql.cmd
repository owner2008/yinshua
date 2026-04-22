@echo off
set "PROJECT_ROOT=%~dp0.."
set "MYSQLD=%PROJECT_ROOT%\.tools\mariadb\bin\mariadbd.exe"
set "DEFAULTS=%PROJECT_ROOT%\.tools\mariadb\my.ini"
set "LOG_DIR=%PROJECT_ROOT%\.tools\logs"

if not exist "%MYSQLD%" (
  echo MariaDB runtime not found at %MYSQLD%
  exit /b 1
)

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

start "yinshua-mariadb" /D "%PROJECT_ROOT%" "%MYSQLD%" "--defaults-file=%DEFAULTS%" "--console"
echo MariaDB start command sent for 127.0.0.1:3306.
