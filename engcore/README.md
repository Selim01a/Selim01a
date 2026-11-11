# ENGINEERING//CORE M0

Offline-first, solver-independent structural-engineering workstation.

**M0 path:** closed-solid STEP → unit confirmation → TET4 mesh → quality metrics → versioned rules → report + mesh export → CLI and desktop UI.

## Quick start

```bash
cd engcore
python -m pip install -e ".[dev]"
pytest
engcore run --fixture unit-cube --out /tmp/engcore-out
engcore-desktop   # optional Tk UI
```

## Docs
- [PRD](docs/PRD_M0.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Contracts](docs/CONTRACTS.md)
- [Acceptance](docs/ACCEPTANCE.md)
- [Model matrix](docs/MODEL_MATRIX.md)
- [Agent rules](AGENTS.md)

## Security
Customer STEP files are never uploaded. See `docs/ADR_0001_licensing_data_security.md`.
