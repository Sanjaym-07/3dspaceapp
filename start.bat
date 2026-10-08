@echo off
title VERTICAD - 3D ULPIN Platform Launcher
color 0B

echo ===============================================================================
echo                   VERTICAD : 3D ULPIN MAPPING PLATFORM
echo         Smart India Hackathon 2026 Prototype - PS26011 (DoLR / MoRD)
echo ===============================================================================
echo.

cd /d "%~dp0"

echo [1/3] Initializing Database & Seed Records...
cd backend
python seed_data.py
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Database initialization failed. Ensure Python 3.11+ is installed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Launching FastAPI Backend Server on http://localhost:8000 ...
start "VERTICAD Backend (FastAPI)" cmd /k "python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 >nul

echo.
echo [3/3] Launching React Vite Frontend on http://localhost:5173 ...
cd ..\frontend
start "VERTICAD Frontend (React Vite)" cmd /k "npm run dev"

timeout /t 3 >nul

echo.
echo ===============================================================================
echo  VERTICAD is running!
echo  Backend Docs: http://localhost:8000/docs
echo  Frontend UI:  http://localhost:5173
echo ===============================================================================
echo.

start http://localhost:5173

pause
