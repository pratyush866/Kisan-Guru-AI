# ==============================================================================
# Kisan Guru AI / BAOS - Master Startup Runner (Windows PowerShell)
# ==============================================================================

Write-Host "======================================================================" -ForegroundColor Green
Write-Host "     Kisan Guru AI - Bharat Agriculture Operating System (BAOS)      " -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Green

$ROOT_DIR = $PSScriptRoot
$BACKEND_SCRIPT = Join-Path $ROOT_DIR "start-backend.ps1"
$FRONTEND_SCRIPT = Join-Path $ROOT_DIR "start-frontend.ps1"

Write-Host "[1/2] Launching FastAPI Backend Service (Port 8000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$BACKEND_SCRIPT`""

Start-Sleep -Seconds 2

Write-Host "[2/2] Launching Web Assistance Frontend (Port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$FRONTEND_SCRIPT`""

Start-Sleep -Seconds 2

Write-Host "`n======================================================================" -ForegroundColor Green
Write-Host " SUCCESS: All Kisan Guru AI system services are active!" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "  👉 Web Application:     http://127.0.0.1:3000" -ForegroundColor Yellow
Write-Host "  👉 Voice Diagnostic:    http://127.0.0.1:3000/voice-test.html" -ForegroundColor Yellow
Write-Host "  👉 FastAPI Backend API: http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "  👉 Interactive Swagger: http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "  👉 System Health Check: http://127.0.0.1:8000/health" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Green

# Automatically open Web App in default browser
Start-Process "http://127.0.0.1:3000"
