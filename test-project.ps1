# ==============================================================================
# Kisan Guru AI / BAOS - Automated Test Suite Runner (Windows PowerShell)
# ==============================================================================

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " Running Complete Kisan Guru AI System Automated Test Suite..." -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan

$ROOT_DIR = $PSScriptRoot
$BACKEND_DIR = Join-Path $ROOT_DIR "fastapi-backend"

Set-Location $BACKEND_DIR

# Determine Python executable
$PYTHON_CMD = "python"
if (Test-Path (Join-Path $BACKEND_DIR "venv\Scripts\python.exe")) {
    $PYTHON_CMD = Join-Path $BACKEND_DIR "venv\Scripts\python.exe"
} elseif (Test-Path (Join-Path $BACKEND_DIR ".venv\Scripts\python.exe")) {
    $PYTHON_CMD = Join-Path $BACKEND_DIR ".venv\Scripts\python.exe"
} elseif (Test-Path (Join-Path $ROOT_DIR "venv\Scripts\python.exe")) {
    $PYTHON_CMD = Join-Path $ROOT_DIR "venv\Scripts\python.exe"
} elseif (Test-Path (Join-Path $ROOT_DIR ".venv\Scripts\python.exe")) {
    $PYTHON_CMD = Join-Path $ROOT_DIR ".venv\Scripts\python.exe"
}

Write-Host "[STEP 1] Running Smart Irrigation Unit Tests..." -ForegroundColor Yellow
& $PYTHON_CMD tests/run_tests.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Irrigation Unit Test Suite Failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n[STEP 2] Running Full Pytest Test Suite..." -ForegroundColor Yellow
& $PYTHON_CMD -m pytest tests/
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Pytest Suite Failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n[STEP 3] Testing Weather & Gemini AI Integration APIs..." -ForegroundColor Yellow
& $PYTHON_CMD test_all.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] API Integration Suite Failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n======================================================================" -ForegroundColor Green
Write-Host " 🎉 ALL KISAN GURU AI AUTOMATED TEST SUITES PASSED (100% SUCCESS)!" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
