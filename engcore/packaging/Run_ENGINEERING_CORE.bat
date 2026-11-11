@echo off
cd /d "%~dp0\.."
REM Windows: never use offscreen Qt — that breaks the 3D viewer backbone.
set QT_OPENGL=desktop
if /I "%QT_QPA_PLATFORM%"=="offscreen" set QT_QPA_PLATFORM=
echo Installing ENGINEERING//CORE desktop (3D) extras...
python -m pip install -e ".[desktop]"
if errorlevel 1 (
  echo pip failed. Is Python 3.11+ on PATH?
  pause
  exit /b 1
)
echo Launching 3D workspace...
python -m engcore.desktop
if errorlevel 1 pause
