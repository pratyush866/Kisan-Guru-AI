# ==============================================================================
# Kisan Guru AI - Backend Server Launcher (Windows PowerShell)
# ==============================================================================

$Host.UI.RawUI.WindowTitle = "Kisan Guru AI - FastAPI Backend Server"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " Starting Kisan Guru AI Backend Server (FastAPI)..." -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan

$ROOT_DIR = $PSScriptRoot
$BACKEND_DIR = Join-Path $ROOT_DIR "fastapi-backend"

if (-not (Test-Path $BACKEND_DIR)) {
    Write-Host "[ERROR] Backend directory not found at $BACKEND_DIR" -ForegroundColor Red
    exit 1
}

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

Write-Host "[INFO] Using Python executable: $PYTHON_CMD" -ForegroundColor Yellow
Write-Host "[INFO] Server starting at: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "[INFO] Interactive Swagger Docs: http://127.0.0.1:8000/docs" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan

& $PYTHON_CMD -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
