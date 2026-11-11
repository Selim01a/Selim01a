@echo off
REM Fallback launcher when running from a source checkout on Windows (needs Python).
cd /d "%~dp0\.."
python -m pip install -e ".[dev]"
python -m engcore.desktop
if errorlevel 1 pause
