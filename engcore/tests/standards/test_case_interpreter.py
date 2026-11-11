from __future__ import annotations

from pathlib import Path

from engcore.domain.analysis import AnalysisContext
from engcore.domain.models import UnitPolicy
from engcore.geometry.features import detect_feature_hints
from engcore.geometry.regions import list_regions
from engcore.geometry.synthetic import SyntheticGeometryImporter
from engcore.orchestration.pipeline import (
    compare_strategies,
    interpret_analysis_case,
    propose_strategies,
    run_with_strategy,
)
from engcore.standards.case_review import review_mesh_against_case

PKG = Path(__file__).resolve().parents[2] / "src" / "engcore" / "data" / "fixtures"


def _plate():
    policy = UnitPolicy(source_unit="m", confirmed_by_user=True, scale_to_si=1.0)
    return SyntheticGeometryImporter().import_step(PKG / "plate_with_hole.json", policy)


def test_interpret_static_hole_case() -> None:
    geo = _plate()
    regions = list_regions(geo)
    hints = detect_feature_hints(geo, tuple(r.region_id for r in regions))
    ctx = AnalysisContext(analysis_type="static_structural", solver_target="ansys_mechanical")
    brief = interpret_analysis_case(
        geo, ctx, regions=regions, feature_hints=hints, selected_regions=()
    )
    assert brief.primary_method.method_id == "static-hole-aware"
    assert brief.feature_length_m is not None
    assert brief.primary_method.local_size_m is not None
    assert any("hole" in m.lower() for m in brief.mesh_drivers)
    assert brief.missing_inputs  # BCs/material always missing from STEP


def test_crash_case_marks_contact_gap() -> None:
    geo = _plate()
    ctx = AnalysisContext(
        analysis_type="impact_crash",
        solver_target="ansys_mechanical",
        expects_contact=True,
    )
    brief = interpret_analysis_case(geo, ctx, selected_regions=())
    assert any("explicit" in s.lower() or "ls-dyna" in s.lower() for s in brief.solver_notes)
    assert any("contact" in m.lower() for m in brief.missing_inputs)


def test_mesh_review_against_case(tmp_path: Path) -> None:
    geo = _plate()
    regions = list_regions(geo)
    hints = detect_feature_hints(geo, tuple(r.region_id for r in regions))
    ctx = AnalysisContext(analysis_type="static_structural", solver_target="generic_tet")
    brief = interpret_analysis_case(
        geo, ctx, regions=regions, feature_hints=hints, selected_regions=("hole-wall",)
    )
    proposal = propose_strategies(
        geo, ctx, ("hole-wall",), feature_hints=hints, regions=regions, brief=brief
    )
    run, review = run_with_strategy(
        geo, proposal.recommended, tmp_path / "one", brief=brief
    )
    assert review is not None
    assert review.overall in {"MEETS_DEMO_TARGETS", "MIXED", "MISSES_TARGETS"}
    assert run.mesh.n_cells > 0
    # Direct review API
    again = review_mesh_against_case(brief, run.metrics, method_id=run.mesh.strategy_id or "")
    assert again.target_results


def test_compare_includes_reviews(tmp_path: Path) -> None:
    geo = _plate()
    regions = list_regions(geo)
    hints = detect_feature_hints(geo, tuple(r.region_id for r in regions))
    ctx = AnalysisContext(analysis_type="static_structural", solver_target="generic_tet")
    brief = interpret_analysis_case(geo, ctx, regions=regions, feature_hints=hints)
    proposal = propose_strategies(geo, ctx, feature_hints=hints, regions=regions, brief=brief)
    session = compare_strategies(
        geo,
        ctx,
        [proposal.recommended, *proposal.alternatives],
        tmp_path / "cmp",
        brief=brief,
    )
    assert len(session.variants) >= 2
    assert session.feature_warnings
    # Strategies should differ in cell count for plate
    cells = {v.n_cells for v in session.variants}
    assert len(cells) >= 2
