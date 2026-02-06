@echo off
echo ==========================================
echo Starting HelperMatch Platform
echo ==========================================
echo.
echo This script runs the application using Command Prompt
echo to avoid PowerShell execution policy issues.
echo.
echo Starting Backend and Frontend...
echo.
cmd /c "npm run run-all"
pause
