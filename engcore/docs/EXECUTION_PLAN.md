# Execution Plan — M0

1. **Gate 0** — skeleton, deps, ADR, fixtures, MODEL_MATRIX
2. **Gate 1** — freeze domain models/ports
3. **EC-002 Geometry** — STEP import (synthetic + optional gmsh)
4. **EC-003 Meshing** — TET4 mesh adapter
5. **EC-004 Standards** — safe rulebook + evaluator
6. **EC-005 Quality/Reporting** — metrics + JSON export
7. **EC-006 Desktop** — minimal Tk UI binding
8. **EC-007 Integration/CI** — e2e tests + GitHub Actions
9. Agent 00 merges continuous CLI smoke after each gate
