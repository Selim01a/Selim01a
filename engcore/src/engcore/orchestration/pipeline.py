"""End-to-end M0 pipeline: STEP → mesh → metrics → rules → export."""

from __future__ import annotations

import uuid
from pathlib import Path

from engcore.domain.models import PipelineRun, UnitPolicy
from engcore.geometry.factory import get_geometry_importer
from engcore.meshing.factory import get_mesher
from engcore.quality.metrics import GeometricMetricComputer
from engcore.reporting.exporter import JsonReportExporter
from engcore.standards.engine import SafeRuleEngine


def make_unit_policy(source_unit: str, confirmed: bool) -> UnitPolicy:
    if source_unit not in {"m", "mm"}:
        raise ValueError("source_unit must be 'm' or 'mm'")
    scale = 1.0 if source_unit == "m" else 0.001
    return UnitPolicy(
        source_unit=source_unit,  # type: ignore[arg-type]
        confirmed_by_user=confirmed,
        scale_to_si=scale,
    )


def run_pipeline(
    input_path: Path,
    out_dir: Path,
    *,
    units: str = "m",
    confirm_units: bool = False,
    max_size_m: float = 0.5,
    prefer_gmsh: bool = False,
) -> PipelineRun:
    unit_policy = make_unit_policy(units, confirm_units)
    importer = get_geometry_importer(prefer_gmsh=prefer_gmsh)
    mesher = get_mesher(prefer_gmsh=prefer_gmsh)
    metrics_computer = GeometricMetricComputer()
    rules = SafeRuleEngine()
    exporter = JsonReportExporter()

    geometry = importer.import_step(Path(input_path), unit_policy)
    if not geometry.is_closed_solid:
        raise ValueError("Pipeline aborted: geometry is not a closed solid.")

    mesh = mesher.mesh_tet4(geometry, max_size_m=max_size_m)
    metrics = metrics_computer.compute(mesh)
    decisions = rules.evaluate(metrics)

    run = PipelineRun(
        run_id=str(uuid.uuid4()),
        geometry=geometry,
        mesh=mesh,
        metrics=metrics,
        decisions=decisions,
    )
    run.artifacts = exporter.export(run, Path(out_dir))
    return run
