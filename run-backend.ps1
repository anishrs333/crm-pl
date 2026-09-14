Set-Location -Path "$PSScriptRoot\backend"
if (Test-Path ".\venv\Scripts\python.exe") {
    Write-Host "[CRM Backend] Starting Django server on http://127.0.0.1:8000 ..." -ForegroundColor Green
    & ".\venv\Scripts\python.exe" manage.py runserver 0.0.0.0:8000
} else {
    Write-Host "[ERROR] Virtual environment not found in backend\venv" -ForegroundColor Red
}
