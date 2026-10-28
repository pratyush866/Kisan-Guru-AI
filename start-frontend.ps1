# ==============================================================================
# Kisan Guru AI - Web Frontend Launcher (Windows PowerShell)
# ==============================================================================

$Host.UI.RawUI.WindowTitle = "Kisan Guru AI - Web Assistance Frontend"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " Starting Kisan Guru AI Web Assistance Frontend..." -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan

$ROOT_DIR = $PSScriptRoot
$FRONTEND_DIR = Join-Path $ROOT_DIR "ai-assistance-web"

if (-not (Test-Path $FRONTEND_DIR)) {
    Write-Host "[ERROR] Frontend directory not found at $FRONTEND_DIR" -ForegroundColor Red
    exit 1
}

Set-Location $FRONTEND_DIR

# Determine Python executable for HTTP dev server
$PYTHON_CMD = "python"
if (Test-Path (Join-Path $ROOT_DIR "fastapi-backend\venv\Scripts\python.exe")) {
    $PYTHON_CMD = Join-Path $ROOT_DIR "fastapi-backend\venv\Scripts\python.exe"
} elseif (Test-Path (Join-Path $ROOT_DIR "fastapi-backend\.venv\Scripts\python.exe")) {
    $PYTHON_CMD = Join-Path $ROOT_DIR "fastapi-backend\.venv\Scripts\python.exe"
} elseif (Test-Path (Join-Path $ROOT_DIR "venv\Scripts\python.exe")) {
    $PYTHON_CMD = Join-Path $ROOT_DIR "venv\Scripts\python.exe"
} elseif (Test-Path (Join-Path $ROOT_DIR ".venv\Scripts\python.exe")) {
    $PYTHON_CMD = Join-Path $ROOT_DIR ".venv\Scripts\python.exe"
}

Write-Host "[INFO] Server starting at: http://127.0.0.1:3000" -ForegroundColor Green
Write-Host "[INFO] Developer Voice Test: http://127.0.0.1:3000/voice-test.html" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan

& $PYTHON_CMD dev_server.py 3000
