$projectRoot = Split-Path -Parent $PSScriptRoot
$nodePath = Join-Path $projectRoot ".tools\node"

if (-not (Test-Path (Join-Path $nodePath "node.exe"))) {
  throw "Node runtime not found at $nodePath"
}

$env:Path = "$nodePath;$env:Path"

Write-Host "Development environment ready."
Write-Host "node: $(node -v)"
Write-Host "npm:  $(npm -v)"
Write-Host "pnpm: $(pnpm -v)"

