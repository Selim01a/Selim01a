from __future__ import annotations

from pathlib import Path

import pytest

from engcore.domain.analysis import AnalysisContext
from engcore.domain.models import UnitPolicy
from engcore.geometry.synthetic import SyntheticGeometryImporter
from engcore.orchestration.pipeline import compare_strategies, propose_strategies
from engcore.standards.mesh_advisor import MeshStrategyAdvisor

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"


def _geo():
    policy = UnitPolicy(source_unit="m", confirmed_by_user=True, scale_to_si=1.0)
    return SyntheticGeometryImporter().import_step(FIXTURES / "unit_cube.json", policy)


def test_advisor_requires_analysis_type() -> None:
    with pytest.raises(ValueError, match="Analysis type is required"):
        MeshStrategyAdvisor().propose(
            _geo(),
            AnalysisContext(analysis_type="unknown", solver_target="generic_tet"),
        )


def test_static_recommendation_and_compare(tmp_path: Path) -> None:
    geo = _geo()
    ctx = AnalysisContext(analysis_type="static_structural", solver_target="generic_tet")
    proposal = propose_strategies(geo, ctx, ("face-xmax",))
    assert proposal.recommended.element_family == "TET4"
    assert "face-xmax" in proposal.recommended.refine_region_ids
    strategies = [proposal.recommended, *proposal.alternatives]
    session = compare_strategies(geo, ctx, strategies, tmp_path / "cmp")
    assert len(session.variants) >= 2
    assert session.variants[0].n_cells > 0
    assert all(v.report_path for v in session.variants)


def test_crash_warns_without_regions() -> None:
    geo = _geo()
    ctx = AnalysisContext(
        analysis_type="impact_crash",
        solver_target="ls_dyna",
        expects_contact=True,
    )
    proposal = propose_strategies(geo, ctx, ())
    joined = " ".join(proposal.warnings).lower()
    assert "contact" in joined or "missing input" in joined
