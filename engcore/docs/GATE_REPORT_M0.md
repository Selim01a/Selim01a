# Gate Report — ENGINEERING//CORE M0 bootstrap

## Status
**PASS (synthetic vertical slice)** — installable package with CLI smoke, desktop entry, domain freeze, and CI workflow.

## Evidence
Commands (run from `engcore/`):

```bash
python -m pip install -e ".[dev]"
python -m pytest -q
engcore run --fixture unit-cube --confirm-units --units m --out /tmp/engcore-out
```

Recorded locally (2026-11-11):
- `python3 -m pytest -q` → **17 passed**
- CLI overall_status **PASS** with `quality_report.json` + `mesh.json`
- Report includes DEMO rule decisions and solver non-claim disclaimer

## Completed gates
| Gate | Result |
|------|--------|
| Gate 0 skeleton/deps/ADR/fixtures/MODEL_MATRIX | DONE |
| Gate 1 domain models/ports freeze | DONE |
| EC-002..005 vertical slice | DONE (synthetic backend) |
| EC-006 desktop Tk binding | DONE |
| EC-007 integration + CI | DONE |

## Model matrix discipline
See `docs/MODEL_MATRIX.md`. This bootstrap used Agent 00 sequential implementation (no parallel premium escalate). Future hard contract/OCC bugs escalate to Opus per matrix.

## Known limitations
- Full STEP/OCC path requires optional `gmsh` extra; CI uses synthetic adapters.
- Synthetic STEP fixture is marker-based, not a complete STEP parser.
- Desktop UI is Tk minimal; Windows packaging (exe) not yet produced.
- All rules are DEMO maturity — none are APPROVED engineering standards.
- Mesh quality PASS ≠ solver readiness.

## Blockers
None for synthetic M0 path.

## Decisions
1. Hybrid A+B model matrix locked in `docs/MODEL_MATRIX.md`.
2. Package lives under `/engcore` so profile README at repo root is untouched.
3. Vendor types confined to optional gmsh adapter modules.

## Desktop packaging (follow-up)
- Bundled fixtures under `src/engcore/data/fixtures/`
- Demo-ready Tk UI with output folder + open report
- `packaging/build_portable.sh` → Linux onedir zip
- `packaging/build_windows.ps1` → Windows .exe zip (build on Windows)
- Source portable zip for Python hosts (`Run_ENGINEERING_CORE.bat`)

## Next tasks
- Promote selected DEMO rules via ADR when engineering owners approve thresholds
- Produce Windows .exe zip on a Windows machine via `build_windows.ps1`
- Optional Gmsh e2e job on runners with gmsh installed
