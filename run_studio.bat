@echo off
title Video Factory Studio
echo ===================================================
echo       STARTING VIDEO FACTORY LOCAL STUDIO
echo ===================================================
echo [1/2] Launching Golang Studio Server on port 8080...
cd /d "%~dp0\backend-go"

start "" "http://localhost:8080"
video-factory-studio.exe -port 8080
pause
