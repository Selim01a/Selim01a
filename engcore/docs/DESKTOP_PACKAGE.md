# Desktop package — download & try

## Goal
A portable folder/zip you can open on the desktop and try the M0 pipeline without navigating the full repo.

## Quick try (source, any OS with Python 3.11+)

```bash
cd engcore
python -m pip install -e ".[dev,desktop]"
python -m engcore.desktop
```

UI flow: **STEP (CAD only) → case → Otomatik çalıştır → çıktı**.

1. **STEP aç…** — geometry only (no analysis mesh yet)
2. **Unsur ağacı** — hide/show/delete geometry, faces, meshes
3. Set analysis type/solver → **Otomatik çalıştır**
   - detect features → select faces → size (cited) → mesh → export
4. Or manual: size öner / seçiliye mesh / export
5. Progress rail shows each automation step (Ansys-like status)

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
