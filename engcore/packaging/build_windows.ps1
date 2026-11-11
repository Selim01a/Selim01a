# Build Windows portable onedir with PyInstaller.
# Run from an elevated/normal PowerShell inside the engcore folder:
#   powershell -ExecutionPolicy Bypass -File packaging\build_windows.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

python -m pip install -e ".[dev]"
python -m pip install pyinstaller

$Stamp = Get-Date -Format "yyyyMMdd"
$Name = "ENGINEERING_CORE_M0_${Stamp}_Windows_x64"
$Dist = Join-Path $Root "dist"

if (Test-Path $Dist) { Remove-Item -Recurse -Force (Join-Path $Dist "ENGINEERING_CORE") -ErrorAction SilentlyContinue }

pyinstaller --noconfirm --clean packaging\engcore_desktop.spec --distpath $Dist --workpath (Join-Path $Dist "build")

$Out = Join-Path $Dist $Name
New-Item -ItemType Directory -Force -Path $Out | Out-Null
Copy-Item -Recurse -Force (Join-Path $Dist "ENGINEERING_CORE\*") $Out
Copy-Item README.md (Join-Path $Out "README.md")
Copy-Item docs\GATE_REPORT_M0.md (Join-Path $Out "GATE_REPORT.md")
@"
ENGINEERING//CORE M0 — Windows portable

1. Double-click ENGINEERING_CORE.exe
2. Demo fixture → confirm units (m) → Run pipeline
3. Open report folder

Geometric PASS ≠ solver readiness.
"@ | Set-Content -Encoding UTF8 (Join-Path $Out "HOW_TO_RUN.txt")

$Zip = Join-Path $Dist ($Name + ".zip")
if (Test-Path $Zip) { Remove-Item $Zip }
Compress-Archive -Path $Out -DestinationPath $Zip
Write-Host "PORTABLE_ZIP=$Zip"
