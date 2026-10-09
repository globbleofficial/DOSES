@echo off
:: ==============================================================================
:: DOSES PLATFORM - ONE-CLICK LAUNCHER (BACKEND + FRONTEND)
:: ==============================================================================
title DOSES Platform Launcher
color 0b

echo ==============================================================================
echo       DOSES: DATA OVERWRITE & SANITIZATION ENTERPRISE SYSTEM
echo ==============================================================================
echo.
echo [1/3] Checking Node.js installation...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in PATH! Please install Node.js from https://nodejs.org
    pause
    exit /b
)
echo       Node.js is installed.

echo.
echo [2/3] Starting DOSES Backend API Server on Port 4000...
start "DOSES Backend Core (Port 4000)" cmd /k "cd /d "%~dp0backend" && echo Starting Backend... && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo [3/3] Starting DOSES Frontend Console on Port 5173...
start "DOSES Frontend Console (Port 5173)" cmd /k "cd /d "%~dp0frontend" && echo Starting Frontend... && npm run dev"

timeout /t 2 /nobreak >nul

echo.
echo ==============================================================================
echo SUCCESS: Both servers launched!
echo - Backend API:  http://127.0.0.1:4000
echo - Web Console:  http://127.0.0.1:5173
echo ==============================================================================
echo Opening browser...
start http://127.0.0.1:5173
