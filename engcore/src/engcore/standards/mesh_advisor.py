"""Engineering decision engine for mesh strategy recommendations.

DEMO heuristics only. Does not claim solver readiness. STEP-only decisions
are refused — AnalysisContext is mandatory.
"""

from __future__ import annotations

from engcore.domain.analysis import (
    AnalysisContext,
    GeometryRegion,
    MeshStrategy,
    StrategyProposal,
)
from engcore.domain.models import GeometryModel


class MeshStrategyAdvisor:
    """Recommend tet strategies from analysis context + optional region picks."""

    def require_context(self, context: AnalysisContext | None) -> AnalysisContext:
        if context is None or context.analysis_type == "unknown":
            raise ValueError(
                "Analysis type is required. STEP geometry alone cannot choose a "
                "correct mesh strategy (static vs buckling vs crash vs thermal differ)."
            )
        return context

    def propose(
        self,
        geometry: GeometryModel,
        context: AnalysisContext,
        selected_regions: tuple[str, ...] = (),
    ) -> StrategyProposal:
        context = self.require_context(context)
        char = self._characteristic_length(geometry)
        warnings: list[str] = [
            "DEMO heuristics — not an APPROVED engineering standard.",
            "Geometric mesh quality PASS does not imply solver readiness.",
        ]

        refine = selected_regions or context.critical_result_regions
        if not refine:
            warnings.append(
                "No critical regions selected; global sizing only. "
                "Pick faces/regions for local refinement when stress/contact/hotspots matter."
            )

        if context.analysis_type == "impact_crash":
            if context.solver_target not in {"ls_dyna", "generic_tet"}:
                warnings.append(
                    f"Crash/impact often targets explicit solvers; "
                    f"current target is '{context.solver_target}'."
                )
            recommended = MeshStrategy(
                strategy_id="crash-fine-tet",
                name="Crash / impact — fine TET4 + local refine",
                element_family="TET4",
                global_size_m=max(char / 12.0, char * 0.04),
                local_size_m=max(char / 24.0, char * 0.02),
                refine_region_ids=refine,
                rationale=(
                    "Explicit dynamics needs smaller elements near contact/impact zones; "
                    "global fill stays coarser to limit cost."
                ),
                confidence=0.55,
            )
            alternatives = (
                MeshStrategy(
                    strategy_id="crash-uniform-fine",
                    name="Uniform fine TET4 (expensive)",
                    element_family="TET4",
                    global_size_m=max(char / 16.0, char * 0.03),
                    local_size_m=None,
                    refine_region_ids=(),
                    rationale="Uniform fine mesh — simpler, costly, little locality.",
                    confidence=0.35,
                ),
            )
        elif context.analysis_type == "buckling":
            recommended = MeshStrategy(
                strategy_id="buckling-mid-tet",
                name="Buckling — medium TET4, refine slender faces",
                element_family="TET4",
                global_size_m=max(char / 8.0, char * 0.06),
                local_size_m=max(char / 16.0, char * 0.03) if refine else None,
                refine_region_ids=refine,
                rationale=(
                    "Buckling needs adequate resolution of wavelength / thin features; "
                    "local refine on selected faces if provided."
                ),
                confidence=0.5,
            )
            alternatives = (
                MeshStrategy(
                    strategy_id="buckling-coarse",
                    name="Coarse survey mesh",
                    element_family="TET4",
                    global_size_m=max(char / 4.0, char * 0.12),
                    local_size_m=None,
                    refine_region_ids=(),
                    rationale="Quick survey only — not for eigenvalue convergence claims.",
                    confidence=0.25,
                ),
            )
        elif context.analysis_type == "thermal":
            recommended = MeshStrategy(
                strategy_id="thermal-grad-tet",
                name="Thermal — gradient-aware TET4",
                element_family="TET4",
                global_size_m=max(char / 8.0, char * 0.07),
                local_size_m=max(char / 20.0, char * 0.025) if refine else None,
                refine_region_ids=refine,
                rationale=(
                    "Refine near heated/cooled surfaces (selected regions); "
                    "STEP does not encode BCs or conductivity."
                ),
                confidence=0.5,
            )
            alternatives = (
                MeshStrategy(
                    strategy_id="thermal-uniform",
                    name="Uniform thermal TET4",
                    element_family="TET4",
                    global_size_m=max(char / 10.0, char * 0.05),
                    local_size_m=None,
                    refine_region_ids=(),
                    rationale="No BC regions known — uniform sizing.",
                    confidence=0.3,
                ),
            )
        elif context.analysis_type == "modal":
            recommended = MeshStrategy(
                strategy_id="modal-mid-tet",
                name="Modal — medium uniform TET4",
                element_family="TET4",
                global_size_m=max(char / 8.0, char * 0.06),
                local_size_m=None,
                refine_region_ids=(),
                rationale="Mode shapes often tolerate mid uniform tet; refine if local mass/stiffness critical.",
                confidence=0.45,
            )
            alternatives = (
                MeshStrategy(
                    strategy_id="modal-fine",
                    name="Fine modal TET4",
                    element_family="TET4",
                    global_size_m=max(char / 14.0, char * 0.04),
                    local_size_m=None,
                    refine_region_ids=(),
                    rationale="Higher mode fidelity at higher cost.",
                    confidence=0.4,
                ),
            )
        else:  # static_structural default
            recommended = MeshStrategy(
                strategy_id="static-balanced-tet",
                name="Static structural — balanced TET4",
                element_family="TET4",
                global_size_m=max(char / 8.0, char * 0.06),
                local_size_m=max(char / 18.0, char * 0.03) if refine else None,
                refine_region_ids=refine,
                rationale=(
                    "Default linear static: moderate global size; "
                    "local refine on selected high-stress / fillet / contact faces."
                ),
                confidence=0.55,
            )
            alternatives = (
                MeshStrategy(
                    strategy_id="static-coarse",
                    name="Coarse static TET4",
                    element_family="TET4",
                    global_size_m=max(char / 4.0, char * 0.12),
                    local_size_m=None,
                    refine_region_ids=(),
                    rationale="Fast preview mesh for layout checks only.",
                    confidence=0.3,
                ),
                MeshStrategy(
                    strategy_id="static-fine",
                    name="Fine static TET4",
                    element_family="TET4",
                    global_size_m=max(char / 14.0, char * 0.035),
                    local_size_m=max(char / 28.0, char * 0.02) if refine else None,
                    refine_region_ids=refine,
                    rationale="Finer mesh for stress peaks — still geometric only.",
                    confidence=0.5,
                ),
            )

        if context.thin_wall_candidate:
            warnings.append(
                "Thin-wall candidate flagged: shell/hybrid may be better than pure tet — "
                "not auto-switched in M1 DEMO."
            )
        if context.expects_contact and not refine:
            warnings.append("Contact expected but no contact faces selected for local refine.")

        return StrategyProposal(
            recommended=recommended,
            alternatives=alternatives,
            warnings=tuple(warnings),
            requires_user_context=True,
        )

    def default_regions(self, geometry: GeometryModel) -> tuple[GeometryRegion, ...]:
        """Session-local bbox faces for selection when CAD topology is unavailable."""
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

    @staticmethod
    def _characteristic_length(geometry: GeometryModel) -> float:
        dx = geometry.bbox_max.x - geometry.bbox_min.x
        dy = geometry.bbox_max.y - geometry.bbox_min.y
        dz = geometry.bbox_max.z - geometry.bbox_min.z
        return max(min(dx, dy, dz), 1e-6)
