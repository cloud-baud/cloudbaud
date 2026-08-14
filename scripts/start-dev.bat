@echo off
REM Quick launcher for CloudBaud dev environment
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File ".\scripts\start-dev.ps1"
