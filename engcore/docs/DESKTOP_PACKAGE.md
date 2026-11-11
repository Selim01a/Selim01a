# Desktop package — download & try

## Goal
A portable folder/zip you can open on the desktop and try the M0 pipeline without navigating the full repo.

## Quick try (source, any OS with Python 3.11+)

```bash
cd engcore
python -m pip install -e ".[dev]"
python -m engcore.desktop
```

Windows double-click fallback: `packaging/Run_ENGINEERING_CORE.bat`

## Build portable zip

### Linux / this CI agent
```bash
cd engcore
bash packaging/build_portable.sh
# → dist/ENGINEERING_CORE_M0_<date>_<os>_<arch>.zip
```

### Windows (for the real Windows .exe users want)
```powershell
cd engcore
powershell -ExecutionPolicy Bypass -File packaging\build_windows.ps1
# → dist\ENGINEERING_CORE_M0_<date>_Windows_x64.zip
```

Unzip → double-click `ENGINEERING_CORE.exe` → **Demo fixture** → confirm units → **Run pipeline**.

## Demo path
1. Demo fixture (unit cube)
2. Units = `m`, confirm
3. Output under `~/ENGINEERING_CORE_runs/run_<timestamp>/`
4. Open `quality_report.json`

Geometric mesh PASS does **not** imply solver readiness.
