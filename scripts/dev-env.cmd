@echo off
set "PROJECT_ROOT=%~dp0.."
set "PATH=%PROJECT_ROOT%\.tools\node;%PROJECT_ROOT%\.tools\mariadb\bin;%PATH%"
set "COREPACK_HOME=%PROJECT_ROOT%\.tools\corepack"
echo Development environment ready.
node -v
npm -v
pnpm -v
