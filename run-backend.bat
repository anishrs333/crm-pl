@echo off
cd /d "%~dp0backend"
if exist "venv\Scripts\python.exe" (
    echo [CRM Backend] Starting Django server on http://127.0.0.1:8000 ...
    venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000
) else (
    echo [ERROR] Virtual environment not found in backend\venv.
    pause
)
