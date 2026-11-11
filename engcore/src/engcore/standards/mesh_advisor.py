"""Engineering decision engine for mesh strategy recommendations.

Builds on CaseInterpreter: analysis case → method plan → MeshStrategy options.
DEMO heuristics only. Does not claim solver readiness.
"""

from __future__ import annotations

from engcore.domain.analysis import (
    AnalysisContext,
    GeometryRegion,
    MeshStrategy,
    StrategyProposal,
)
from engcore.domain.case_brief import AnalysisCaseBrief, MeshMethodPlan
from engcore.domain.models import GeometryModel
from engcore.geometry.features import FeatureHint
from engcore.standards.case_interpreter import CaseInterpreter


class MeshStrategyAdvisor:
    """Recommend tet strategies from an interpreted analysis case."""

    def __init__(self) -> None:
        self._interpreter = CaseInterpreter()

    def require_context(self, context: AnalysisContext | None) -> AnalysisContext:
        if context is None or context.analysis_type == "unknown":
            raise ValueError(
                "Analysis type is required. STEP geometry alone cannot choose a "
                "correct mesh strategy (static vs buckling vs crash vs thermal differ)."
            )
        return context

    def interpret_case(
        self,
        geometry: GeometryModel,
        context: AnalysisContext,
        *,
        regions: tuple[GeometryRegion, ...] = (),
        feature_hints: tuple[FeatureHint, ...] = (),
        selected_regions: tuple[str, ...] = (),
    ) -> AnalysisCaseBrief:
        context = self.require_context(context)
        return self._interpreter.interpret(
            geometry,
            context,
            regions=regions,
            feature_hints=feature_hints,
            selected_regions=selected_regions,
        )

    def propose(
        self,
        geometry: GeometryModel,
        context: AnalysisContext,
        selected_regions: tuple[str, ...] = (),
        feature_hints: tuple[FeatureHint, ...] = (),
        regions: tuple[GeometryRegion, ...] = (),
        brief: AnalysisCaseBrief | None = None,
    ) -> StrategyProposal:
        context = self.require_context(context)
        brief = brief or self.interpret_case(
            geometry,
            context,
            regions=regions,
            feature_hints=feature_hints,
            selected_regions=selected_regions,
        )

        warnings: list[str] = [
            "DEMO methodology — not an APPROVED engineering standard.",
            "Geometric mesh quality PASS does not imply solver readiness.",
            f"Case confidence={brief.confidence:.2f}: {brief.summary}",
        ]
        warnings.extend(f"Physics: {p}" for p in brief.physics_drivers)
        warnings.extend(f"Mesh driver: {m}" for m in brief.mesh_drivers)
        warnings.extend(f"Missing input: {m}" for m in brief.missing_inputs)
        warnings.extend(f"Solver note: {s}" for s in brief.solver_notes)

        recommended = _plan_to_strategy(brief.primary_method, primary=True)
        alternatives = tuple(
            _plan_to_strategy(p, primary=False) for p in brief.alternate_methods
        )

        if context.thin_wall_candidate:
            warnings.append(
                "Thin-wall candidate flagged: shell/hybrid may be better than pure tet — "
                "not auto-switched in DEMO."
            )

        return StrategyProposal(
            recommended=recommended,
            alternatives=alternatives,
            warnings=tuple(warnings),
            requires_user_context=True,
        )

    def default_regions(self, geometry: GeometryModel) -> tuple[GeometryRegion, ...]:
        mn = geometry.bbox_min
        mx = geometry.bbox_max
        faces = [
            ("face-xmin", "Face −X", (mn.x, mn.y, mn.z), (mn.x, mx.y, mx.z)),
            ("face-xmax", "Face +X", (mx.x, mn.y, mn.z), (mx.x, mx.y, mx.z)),
            ("face-ymin", "Face −Y", (mn.x, mn.y, mn.z), (mx.x, mn.y, mx.z)),
            ("face-ymax", "Face +Y", (mn.x, mx.y, mn.z), (mx.x, mx.y, mx.z)),
            ("face-zmin", "Face −Z", (mn.x, mn.y, mn.z), (mx.x, mx.y, mn.z)),
            ("face-zmax", "Face +Z", (mn.x, mn.y, mx.z), (mx.x, mx.y, mx.z)),
        ]
        return tuple(
            GeometryRegion(
                region_id=rid,
                label=label,
                kind="bbox_face",
                bbox_min=bmin,
                bbox_max=bmax,
            )
            for rid, label, bmin, bmax in faces
        )


def _plan_to_strategy(plan: MeshMethodPlan, *, primary: bool) -> MeshStrategy:
    name = plan.method_id.replace("-", " ").title()
    rationale = plan.notes
    if plan.through_thickness_elements:
        rationale += f" Through-thickness ~{plan.through_thickness_elements} elems."
    if plan.elements_around_hole:
        rationale += f" Around feature ~{plan.elements_around_hole} elems."
    return MeshStrategy(
        strategy_id=plan.method_id,
        name=name,
        element_family="TET4",
        global_size_m=plan.global_size_m,
        local_size_m=plan.local_size_m,
        refine_region_ids=plan.refine_region_ids,
        rationale=rationale,
        confidence=0.6 if primary else 0.4,
    )
