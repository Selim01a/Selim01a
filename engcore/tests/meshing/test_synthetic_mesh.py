from __future__ import annotations

from pathlib import Path

from engcore.domain.models import UnitPolicy
from engcore.geometry.synthetic import SyntheticGeometryImporter
from engcore.meshing.synthetic import SyntheticMesher

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"


def test_mesh_tet4_smoke() -> None:
    policy = UnitPolicy(source_unit="m", confirmed_by_user=True, scale_to_si=1.0)
    geo = SyntheticGeometryImporter().import_step(FIXTURES / "unit_cube.json", policy)
    mesh = SyntheticMesher().mesh_tet4(geo, max_size_m=0.5)
    assert mesh.element_type == "TET4"
    assert mesh.n_cells >= 6
    assert mesh.n_nodes >= 8
    assert mesh.geometry_ref == geo.solid_id
