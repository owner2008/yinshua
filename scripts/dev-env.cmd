@echo off
set "PROJECT_ROOT=%~dp0.."
set "DATABASE_BIN=%PROJECT_ROOT%\.tools\mysql-8.4.11-winx64\bin"
if not exist "%DATABASE_BIN%\mysql.exe" set "DATABASE_BIN=%PROJECT_ROOT%\.tools\mariadb\bin"
set "PATH=%PROJECT_ROOT%\.tools\node;%DATABASE_BIN%;%PATH%"
set "COREPACK_HOME=%PROJECT_ROOT%\.tools\corepack"
echo Development environment ready.
node -v
npm -v
pnpm -v
