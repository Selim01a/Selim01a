from __future__ import annotations

from pathlib import Path

from engcore.domain.models import UnitPolicy
from engcore.geometry.synthetic import SyntheticGeometryImporter
from engcore.meshing.synthetic import SyntheticMesher
from engcore.quality.metrics import GeometricMetricComputer

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"


def test_metrics_named_and_unit_bearing() -> None:
    policy = UnitPolicy(source_unit="m", confirmed_by_user=True, scale_to_si=1.0)
    geo = SyntheticGeometryImporter().import_step(FIXTURES / "unit_cube.json", policy)
    mesh = SyntheticMesher().mesh_tet4(geo, max_size_m=0.5)
    metrics = GeometricMetricComputer().compute(mesh)
    names = {m.name for m in metrics.metrics}
    assert "min_tet_volume" in names
    assert "max_aspect_ratio" in names
    assert all(m.units for m in metrics.metrics)
