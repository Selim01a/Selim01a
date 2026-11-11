# Desktop package — download & try

## Goal
A portable folder/zip you can open on the desktop and try the M0 pipeline without navigating the full repo.

## Quick try (source, any OS with Python 3.11+)

```bash
cd engcore
python -m pip install -e ".[dev,desktop]"
python -m engcore.desktop
```

UI flow (one job): **STEP import (CAD only) → unsur ağacı / yüzey seç → element+size ile mesh → çıktı**.

1. **STEP seç…** — shows **geometry only** (no automatic analysis mesh)
2. **Unsur ağacı** — geometry / faces / meshes; hide/show/delete
3. Set analysis case → **Size öner** (Autodesk / ICEMM / MSC / NAFEMS citations — see `docs/MESH_SIZING.md`)
4. Choose **TRI3 (yüzey)** or **TET4 (hacim)** + global/local size → **Seçili yüzeye mesh uygula**
5. Export mesh package (JSON + VTK/STL)

The **3D viewer is mandatory** (PySide6 + PyVista + PyVistaQt + Gmsh). Do not set `QT_QPA_PLATFORM=offscreen` on Windows — that breaks OpenGL. The Windows launcher sets `QT_OPENGL=desktop`.

Windows double-click: `packaging/Run_ENGINEERING_CORE.bat` (from a source checkout) or `Run_ENGINEERING_CORE.bat` inside the tryout zip.

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

Unzip → double-click `ENGINEERING_CORE.exe` → **STEP seç** or **Demo** → confirm units → **Mesh üret**.

## Demo path
1. **Demo (plate+hole)** or open your own STEP
2. Units = `m` or `mm`, confirm
3. Choose analysis type → **Analiz et** → **Mesh üret**
4. Output under `~/ENGINEERING_CORE_runs/run_<timestamp>/mesh_export/`

Geometric mesh PASS does **not** imply solver readiness.
