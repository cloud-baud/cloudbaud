@echo off
echo Starting CloudBaud CFP Scout Agent...
cd backend
venv\Scripts\python agents\scout\scout_agent.py
pause
