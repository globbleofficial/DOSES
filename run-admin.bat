@echo off
:: ==============================================================================
:: DOSES: RUN BACKEND AS ADMINISTRATOR (UAC ELEVATION)
:: ==============================================================================
echo [DOSES] Requesting Administrator Privileges for Direct Hardware & File Access...

net session >nul 2>&1
if %errorLevel% == 0 (
    echo [DOSES] Administrator privileges confirmed.
    cd /d "%~dp0backend"
    echo [DOSES] Starting DOSES Backend Core on Port 4000...
    npm start
) else (
    echo [DOSES] Prompting for Windows Administrator elevation...
    powershell -Command "Start-Process cmd -ArgumentList '/c cd /d \"%~dp0backend\" && npm start' -Verb RunAs"
)
