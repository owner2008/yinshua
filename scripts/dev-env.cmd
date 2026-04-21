@echo off
set "PROJECT_ROOT=%~dp0.."
set "PATH=%PROJECT_ROOT%\.tools\node;%PATH%"
echo Development environment ready.
node -v
npm -v
pnpm -v
