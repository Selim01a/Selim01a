# ENGINEERING//CORE M0

Offline-first, solver-independent structural-engineering workstation.

**M0 path:** closed-solid STEP → unit confirmation → TET4 mesh → quality metrics → versioned rules → report + mesh export → CLI and desktop UI.

## Quick start

```bash
cd engcore
python -m pip install -e ".[dev]"
pytest
engcore run --fixture unit-cube --confirm-units --units m --out /tmp/engcore-out
python -m engcore.desktop   # Tk UI (or engcore-desktop)
```

## Desktop package (download & try)

See [docs/DESKTOP_PACKAGE.md](docs/DESKTOP_PACKAGE.md).

```bash
# Linux portable zip (this machine)
bash packaging/build_portable.sh

# Windows .exe zip (run on Windows)
powershell -ExecutionPolicy Bypass -File packaging\build_windows.ps1
```

Source portable (Python required): unzip and run `Run_ENGINEERING_CORE.bat` / `python -m engcore.desktop`.

## Docs
- [PRD](docs/PRD_M0.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Contracts](docs/CONTRACTS.md)
- [Acceptance](docs/ACCEPTANCE.md)
- [Model matrix](docs/MODEL_MATRIX.md)
- [Desktop package](docs/DESKTOP_PACKAGE.md)
- [Agent rules](AGENTS.md)

## Security
Customer STEP files are never uploaded. See `docs/ADR_0001_licensing_data_security.md`.
