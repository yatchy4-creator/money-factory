Write-Host "[autofix] Starting auto-fix routine"
$projectRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $projectRoot "mvp\backend"
$frontendDir = Join-Path $projectRoot "mvp\frontend"
$backendEnv = Join-Path $backendDir ".env"
$backendEnvExample = Join-Path $backendDir ".env.example"

function Run-Step($name, $scriptBlock) {
  Write-Host "[autofix] $name"
  try { & $scriptBlock }
  catch {
    Write-Host "[autofix] FAILED: $name - $($_.Exception.Message)" -ForegroundColor Red
    throw
  }
}

Run-Step "backend npm install" {
  Push-Location $backendDir
  try { npm install } finally { Pop-Location }
}
Run-Step "frontend npm install" {
  Push-Location $frontendDir
  try { npm install } finally { Pop-Location }
}

if (-not (Test-Path $backendEnv) -and (Test-Path $backendEnvExample)) {
  Copy-Item $backendEnvExample $backendEnv
  Write-Host "[autofix] Created mvp\\backend\\.env from example" -ForegroundColor Yellow
}

Run-Step "backend syntax check" {
  Push-Location $backendDir
  try { node --check src/server.js } finally { Pop-Location }
}
Run-Step "frontend build check" {
  Push-Location $frontendDir
  try { npm run build } finally { Pop-Location }
}

Write-Host "[autofix] Completed" -ForegroundColor Green
