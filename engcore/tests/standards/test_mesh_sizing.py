from __future__ import annotations

from pathlib import Path

from engcore.domain.analysis import AnalysisContext
from engcore.orchestration.pipeline import import_geometry
from engcore.standards.mesh_sizing import recommend_sizes

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"


def test_recommend_sizes_static_thinner_than_char() -> None:
    geo = import_geometry(FIXTURES / "unit_cube.step", units="m", confirm_units=True)
    plan = recommend_sizes(
        geo,
        AnalysisContext(analysis_type="static_structural", solver_target="generic_tet"),
        element_type="TET4",
    )
    assert plan.global_size_m > 0
    assert "Autodesk" in plan.citations[0]
    assert plan.element_type == "TET4"


def test_recommend_surface_uses_size() -> None:
    geo = import_geometry(FIXTURES / "unit_cube.step", units="m", confirm_units=True)
    plan = recommend_sizes(
        geo,
        AnalysisContext(analysis_type="static_structural", solver_target="generic_tet"),
        element_type="TRI3",
        user_global_size_m=0.02,
    )
    assert plan.element_type == "TRI3"
    assert plan.global_size_m == 0.02
