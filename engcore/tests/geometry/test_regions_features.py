from __future__ import annotations

from pathlib import Path

import pytest

from engcore.domain.analysis import AnalysisContext
from engcore.domain.models import UnitPolicy
from engcore.geometry.factory import gmsh_available
from engcore.geometry.features import detect_feature_hints
from engcore.geometry.regions import list_regions
from engcore.geometry.synthetic import SyntheticGeometryImporter
from engcore.orchestration.pipeline import import_geometry, propose_strategies

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"
PKG_FIX = Path(__file__).resolve().parents[2] / "src" / "engcore" / "data" / "fixtures"


def test_plate_fixture_regions_and_hole_hint() -> None:
    policy = UnitPolicy(source_unit="m", confirmed_by_user=True, scale_to_si=1.0)
    geo = SyntheticGeometryImporter().import_step(PKG_FIX / "plate_with_hole.json", policy)
    regions = list_regions(geo)
    ids = {r.region_id for r in regions}
    assert "hole-wall" in ids
    hints = detect_feature_hints(geo, tuple(ids))
    kinds = {h.kind for h in hints}
    assert "hole" in kinds
    proposal = propose_strategies(
        geo,
        AnalysisContext(analysis_type="static_structural", solver_target="generic_tet"),
        (),
        feature_hints=hints,
    )
    assert "hole-wall" in proposal.recommended.refine_region_ids


@pytest.mark.skipif(not gmsh_available(), reason="gmsh not available")
def test_gmsh_box_faces() -> None:
    geo = import_geometry(PKG_FIX / "box_occ.step", units="m", confirm_units=True, prefer_gmsh=True)
    assert geo.backend == "gmsh"
    regions = list_regions(geo)
    assert len(regions) >= 6
    assert all(r.region_id.startswith("cad-face-") for r in regions)
