Write-Host "[diagnose] LeadRescue AI environment check"

$errors = @()
$projectRoot = Split-Path -Parent $PSScriptRoot

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { $errors += "Node.js missing" }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { $errors += "npm missing" }

$backendEnv = Join-Path $projectRoot "mvp\backend\.env"
if (-not (Test-Path $backendEnv)) { $errors += "Missing mvp\backend\.env (copy from .env.example)" }

$required = @(
  "mvp\backend\src\server.js",
  "mvp\frontend\src\App.jsx",
  "PRODUCT_BRIEF.md",
  "RUNBOOK.md"
)

foreach ($f in $required) {
  $fullPath = Join-Path $projectRoot $f
  if (-not (Test-Path $fullPath)) { $errors += "Missing file: $f" }
}

if ($errors.Count -gt 0) {
  Write-Host "[diagnose] Issues found:" -ForegroundColor Yellow
  $errors | ForEach-Object { Write-Host " - $_" }
  exit 1
}

Write-Host "[diagnose] OK" -ForegroundColor Green
exit 0
