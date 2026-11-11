from __future__ import annotations

from pathlib import Path

from engcore.geometry.regions import list_regions
from engcore.meshing.synthetic import SyntheticMesher
from engcore.orchestration.pipeline import import_geometry
from engcore.quality.metrics import GeometricMetricComputer

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"


def test_synthetic_surface_mesh_on_selected_face() -> None:
    geo = import_geometry(FIXTURES / "unit_cube.step", units="m", confirm_units=True)
    regions = list_regions(geo)
    assert regions
    rid = regions[0].region_id
    mesh = SyntheticMesher().mesh_surface_tri3(
        geo,
        face_region_ids=(rid,),
        size_m=0.5,
        regions=regions,
    )
    assert mesh.element_type == "TRI3"
    assert mesh.n_cells >= 2
    assert mesh.target_region_ids == (rid,)
    metrics = GeometricMetricComputer().compute(mesh)
    assert metrics.get("n_elements") is not None
    assert metrics.get("max_aspect_ratio") is not None
