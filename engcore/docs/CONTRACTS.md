# Contracts — ENGINEERING//CORE M0

Frozen by Agent 01. Changes require Agent 00 + Agent 01 approval.

## Units
- Canonical storage: SI metres for lengths, metres³ for volumes.
- Display helper may convert to millimetres.
- Import must set `UnitPolicy.source_unit` and `confirmed_by_user`.

## Core models (Python dataclasses / TypedDict-compatible)
See `src/engcore/domain/models.py` and `src/engcore/domain/ports.py`.

### GeometryModel
- `solid_id: str` — durable logical id (not OCC/Gmsh tag)
- `bbox_min/max: Vec3` — SI metres
- `volume_m3: float`
- `is_closed_solid: bool`
- `unit_policy: UnitPolicy`
- `source_sha256: str`

### MeshModel
- `mesh_id: str`
- `nodes: list[Vec3]` — SI metres
- `cells: list[Tet4]` — 4 node indices each
- `element_type: Literal["TET4"]`
- `geometry_ref: str` — references `GeometryModel.solid_id`
- `backend: Literal["synthetic","gmsh"]`

### MetricSet
- named metrics with units and values (e.g. `min_jacobian`, `max_aspect_ratio`, `min_dihedral_deg`)

### RuleDecision
- `rule_id`, `version`, `metric`, `observed`, `threshold`, `units`, `status` ∈ {PASS, FAIL, NOT_APPLICABLE, ERROR}
- `evidence: str`
- `maturity: Literal["DEMO","APPROVED"]`

## Ports
- `GeometryImporter.import_step(path, unit_confirmation) -> GeometryModel`
- `Mesher.mesh_tet4(geometry, params) -> MeshModel`
- `MetricComputer.compute(mesh) -> MetricSet`
- `RuleEngine.evaluate(metrics, rulebook) -> list[RuleDecision]`
- `ReportExporter.export(run, out_dir) -> ArtifactPaths`

Vendor handles must not appear in these return types.
