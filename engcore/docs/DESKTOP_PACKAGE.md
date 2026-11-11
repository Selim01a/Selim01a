# Desktop package — download & try

## Goal
A portable folder/zip you can open on the desktop and try the M0 pipeline without navigating the full repo.

## Quick try (source, any OS with Python 3.11+)

```bash
cd engcore
python -m pip install -e ".[dev,desktop]"
python -m engcore.desktop
```

UI flow (one job): **STEP aç → analiz tipi/case → yüzeylere mesh → meshli geometri çıktısı**.

1. **STEP seç…** — real `.step` / `.stp` (needs Gmsh; installed with `.[desktop]`)
2. Set **analiz tipi** + solver hints
3. **Analiz et ve strateji öner** — case brief + surface-aware strategy
4. **Mesh üret** — writes `mesh_export/` (JSON + VTK/VTU + STL when available)
5. Optional **Meshli geometriyi dışa aktar…** to pick a folder

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
