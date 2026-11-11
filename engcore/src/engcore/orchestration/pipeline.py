"""End-to-end pipeline: STEP → case interpret → strategy → mesh → review."""

from __future__ import annotations

import uuid
from pathlib import Path

from engcore.domain.analysis import (
    AnalysisContext,
    CompareSession,
    GeometryRegion,
    MeshStrategy,
    MeshVariantResult,
    StrategyProposal,
)
from engcore.domain.case_brief import AnalysisCaseBrief, CaseMeshReview
from engcore.domain.models import PipelineRun, UnitPolicy
from engcore.geometry.factory import get_geometry_importer
from engcore.geometry.features import FeatureHint
from engcore.meshing.factory import get_mesher
from engcore.quality.metrics import GeometricMetricComputer
from engcore.reporting.exporter import JsonReportExporter
from engcore.standards.case_review import review_mesh_against_case
from engcore.standards.engine import SafeRuleEngine
from engcore.standards.mesh_advisor import MeshStrategyAdvisor


def make_unit_policy(source_unit: str, confirmed: bool) -> UnitPolicy:
    if source_unit not in {"m", "mm"}:
        raise ValueError("source_unit must be 'm' or 'mm'")
    scale = 1.0 if source_unit == "m" else 0.001
    return UnitPolicy(
        source_unit=source_unit,  # type: ignore[arg-type]
        confirmed_by_user=confirmed,
        scale_to_si=scale,
    )


def import_geometry(
    input_path: Path,
    *,
    units: str = "m",
    confirm_units: bool = False,
    prefer_gmsh: bool = False,
):
    unit_policy = make_unit_policy(units, confirm_units)
    path = Path(input_path)
    importer = get_geometry_importer(prefer_gmsh=prefer_gmsh, path=path)
    geometry = importer.import_step(path, unit_policy)
    if not geometry.is_closed_solid:
        raise ValueError("Pipeline aborted: geometry is not a closed solid.")
    return geometry


def interpret_analysis_case(
    geometry,
    context: AnalysisContext,
    *,
    regions: tuple[GeometryRegion, ...] = (),
    feature_hints: tuple[FeatureHint, ...] = (),
    selected_regions: tuple[str, ...] = (),
) -> AnalysisCaseBrief:
    return MeshStrategyAdvisor().interpret_case(
        geometry,
        context,
        regions=regions,
        feature_hints=feature_hints,
        selected_regions=selected_regions,
    )


def propose_strategies(
    geometry,
    context: AnalysisContext,
    selected_regions: tuple[str, ...] = (),
    feature_hints=(),
    regions: tuple[GeometryRegion, ...] = (),
    brief: AnalysisCaseBrief | None = None,
) -> StrategyProposal:
    return MeshStrategyAdvisor().propose(
        geometry,
        context,
        selected_regions,
        feature_hints=feature_hints,
        regions=regions,
        brief=brief,
    )


def run_with_strategy(
    geometry,
    strategy: MeshStrategy,
    out_dir: Path,
    *,
    prefer_gmsh: bool = False,
    brief: AnalysisCaseBrief | None = None,
) -> tuple[PipelineRun, CaseMeshReview | None]:
    mesher = get_mesher(prefer_gmsh=prefer_gmsh)
    metrics_computer = GeometricMetricComputer()
    rules = SafeRuleEngine()
    exporter = JsonReportExporter()

    try:
        mesh = mesher.mesh_tet4(geometry, max_size_m=strategy.global_size_m, strategy=strategy)
    except TypeError:
        mesh = mesher.mesh_tet4(geometry, max_size_m=strategy.global_size_m)

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
    review = None
    if brief is not None:
        review = review_mesh_against_case(brief, metrics, method_id=strategy.strategy_id)
    return run, review


def compare_strategies(
    geometry,
    context: AnalysisContext,
    strategies: list[MeshStrategy],
    out_root: Path,
    *,
    selected_regions: list[str] | None = None,
    prefer_gmsh: bool = False,
    brief: AnalysisCaseBrief | None = None,
) -> CompareSession:
    session = CompareSession(
        geometry_id=geometry.solid_id,
        context=context,
        selected_regions=list(selected_regions or []),
    )
    for strategy in strategies:
        out_dir = Path(out_root) / strategy.strategy_id
        run, review = run_with_strategy(
            geometry, strategy, out_dir, prefer_gmsh=prefer_gmsh, brief=brief
        )
        min_vol = run.metrics.get("min_tet_volume")
        aspect = run.metrics.get("max_aspect_ratio")
        session.variants.append(
            MeshVariantResult(
                strategy=strategy,
                mesh_id=run.mesh.mesh_id,
                n_nodes=run.mesh.n_nodes,
                n_cells=run.mesh.n_cells,
                min_tet_volume=min_vol.value if min_vol else None,
                max_aspect_ratio=aspect.value if aspect else None,
                overall_rule_status=run.overall_status(),
                report_path=run.artifacts.report_json if run.artifacts else None,
                mesh=run.mesh,
            )
        )
        if review is not None:
            session.feature_warnings.append(review.narrative)
    return session


def run_pipeline(
    input_path: Path,
    out_dir: Path,
    *,
    units: str = "m",
    confirm_units: bool = False,
    max_size_m: float = 0.5,
    prefer_gmsh: bool = False,
    context: AnalysisContext | None = None,
    selected_regions: tuple[str, ...] = (),
    strategy: MeshStrategy | None = None,
) -> PipelineRun:
    geometry = import_geometry(
        input_path, units=units, confirm_units=confirm_units, prefer_gmsh=prefer_gmsh
    )
    brief = None
    if strategy is None:
        if context is not None:
            brief = interpret_analysis_case(
                geometry, context, selected_regions=selected_regions
            )
            proposal = propose_strategies(
                geometry, context, selected_regions, brief=brief
            )
            strategy = proposal.recommended
        else:
            strategy = MeshStrategy(
                strategy_id="legacy-default",
                name="Legacy default size",
                element_family="TET4",
                global_size_m=max_size_m,
                local_size_m=None,
                refine_region_ids=selected_regions,
                rationale="No analysis context — size-only path (not recommended).",
                confidence=0.2,
            )
    run, _review = run_with_strategy(
        geometry, strategy, out_dir, prefer_gmsh=prefer_gmsh, brief=brief
    )
    return run
