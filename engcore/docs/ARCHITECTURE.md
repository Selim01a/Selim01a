# Architecture — ENGINEERING//CORE M0

## Layers
```
CLI / Desktop UI
      ↓
Orchestration pipeline (Agent 00)
      ↓
Ports (Agent 01 domain) ← adapters never leak vendor types
      ↓
Geometry | Meshing | Standards | Quality | Reporting
```

## Principles
- **Offline-first:** no mandatory cloud calls for CAD processing.
- **SI inside core:** millimetres only for display.
- **Adapter isolation:** Gmsh/OCC/VTK types stay in adapter modules.
- **Explainable rules:** every decision carries id, version, metric, observed, threshold, units, status, evidence.
- **Provenance:** SHA-256 of inputs recorded on every run artifact.

## Pipeline stages
1. `import_step` → `GeometryModel` + unit confirmation
2. `mesh_tet4` → `MeshModel` (nodes, TET4 cells, SI coords)
3. `compute_metrics` → `MetricSet`
4. `evaluate_rules` → `RuleResultSet` (DEMO vs APPROVED)
5. `export_artifacts` → report JSON + mesh dump

## Optional backends
- `geometry.adapters.synthetic` / `meshing.adapters.synthetic` — always available for CI/smoke
- `geometry.adapters.gmsh_occ` / `meshing.adapters.gmsh` — used when `gmsh` is installed
