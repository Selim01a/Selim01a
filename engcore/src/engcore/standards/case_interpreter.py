"""Interpret analysis case → mesh method plan.

STEP provides geometry; the user provides physics intent. This module turns both
into an explainable case brief that drives meshing — DEMO methodology, not a code.
"""

from __future__ import annotations

from engcore.domain.analysis import AnalysisContext, GeometryRegion
from engcore.domain.case_brief import (
    AnalysisCaseBrief,
    MeshMethodPlan,
    QualityTarget,
)
from engcore.domain.models import GeometryModel
from engcore.geometry.features import FeatureHint


class CaseInterpreter:
    def interpret(
        self,
        geometry: GeometryModel,
        context: AnalysisContext,
        *,
        regions: tuple[GeometryRegion, ...] = (),
        feature_hints: tuple[FeatureHint, ...] = (),
        selected_regions: tuple[str, ...] = (),
    ) -> AnalysisCaseBrief:
        if context.analysis_type == "unknown":
            raise ValueError("Cannot interpret case without analysis type.")

        char = _characteristic_length(geometry)
        feature_len = _feature_length_m(feature_hints, regions)
        refine = _resolve_refine(selected_regions, context, feature_hints)
        missing = _missing_inputs(context, refine, feature_hints)
        physics, mesh_drivers, solver_notes = _physics_block(context, feature_hints, refine)
        targets = _quality_targets(context)
        primary, alts = _method_plans(context, char, feature_len, refine, geometry)

        title = (
            f"{context.analysis_type} → {context.solver_target} "
            f"on {geometry.solid_id}"
        )
        summary = (
            f"Case treats '{geometry.solid_id}' as a {context.analysis_type} problem "
            f"for {context.solver_target}. "
            f"Characteristic length={char:.4g} m"
            + (f", feature length≈{feature_len:.4g} m." if feature_len else ".")
            + " Mesh sizing follows the primary method below; STEP alone did not choose it."
        )

        confidence = 0.4
        if refine:
            confidence += 0.1
        if feature_len:
            confidence += 0.1
        if not missing:
            confidence += 0.1
        confidence = min(confidence, 0.75)

        return AnalysisCaseBrief(
            title=title,
            summary=summary,
            physics_drivers=physics,
            mesh_drivers=mesh_drivers,
            missing_inputs=missing,
            solver_notes=solver_notes,
            feature_length_m=feature_len,
            characteristic_length_m=char,
            quality_targets=targets,
            primary_method=primary,
            alternate_methods=alts,
            confidence=confidence,
        )


def _characteristic_length(geometry: GeometryModel) -> float:
    dx = geometry.bbox_max.x - geometry.bbox_min.x
    dy = geometry.bbox_max.y - geometry.bbox_min.y
    dz = geometry.bbox_max.z - geometry.bbox_min.z
    return max(min(dx, dy, dz), 1e-6)


def _feature_length_m(
    hints: tuple[FeatureHint, ...],
    regions: tuple[GeometryRegion, ...],
) -> float | None:
    by_id = {r.region_id: r for r in regions}
    lengths: list[float] = []
    for h in hints:
        if h.kind != "hole":
            continue
        for rid in h.related_region_ids:
            r = by_id.get(rid)
            if not r or not r.bbox_min or not r.bbox_max:
                continue
            # Approximate hole diameter from face bbox min planar extent
            sx = abs(r.bbox_max[0] - r.bbox_min[0])
            sy = abs(r.bbox_max[1] - r.bbox_min[1])
            sz = abs(r.bbox_max[2] - r.bbox_min[2])
            dims = sorted([sx, sy, sz])
            # Cylinder wall AABB: two larger dims ≈ diameter, smallest often thickness/height
            if dims[2] > 0 and dims[0] / dims[2] <= 0.6:
                diameter = 0.5 * (dims[1] + dims[2])
            else:
                diameter = dims[0]
            lengths.append(max(diameter, 1e-6))
    if not lengths:
        return None
    return min(lengths)


def _resolve_refine(
    selected: tuple[str, ...],
    context: AnalysisContext,
    hints: tuple[FeatureHint, ...],
) -> tuple[str, ...]:
    if selected:
        return selected
    if context.critical_result_regions:
        return context.critical_result_regions
    auto: list[str] = []
    for h in hints:
        if h.kind in {"hole", "fillet_candidate"} and h.related_region_ids:
            auto.extend(h.related_region_ids)
    return tuple(dict.fromkeys(auto))


def _missing_inputs(
    context: AnalysisContext,
    refine: tuple[str, ...],
    hints: tuple[FeatureHint, ...],
) -> tuple[str, ...]:
    missing: list[str] = []
    missing.append("Boundary conditions / load directions (not in STEP)")
    missing.append("Material model / allowables (not in STEP)")
    if context.analysis_type in {"impact_crash", "static_structural"} and context.expects_contact and not refine:
        missing.append("Contact faces for local refinement")
    if context.analysis_type == "thermal":
        missing.append("Heat flux / convection surfaces")
    if context.analysis_type == "buckling":
        missing.append("Expected buckle wavelength / critical flange")
    if any(h.kind == "thin_wall" for h in hints) and not context.thin_wall_candidate:
        missing.append("Confirm thin-wall / shell modelling intent")
    return tuple(missing)


def _physics_block(
    context: AnalysisContext,
    hints: tuple[FeatureHint, ...],
    refine: tuple[str, ...],
) -> tuple[tuple[str, ...], tuple[str, ...], tuple[str, ...]]:
    physics: list[str] = []
    mesh: list[str] = []
    solver: list[str] = []

    if context.analysis_type == "static_structural":
        physics.append("Linear/static stress recovery dominates; gradients near notches/holes matter.")
        mesh.append("Local refine at holes/fillets/contact; moderate global fill.")
    elif context.analysis_type == "buckling":
        physics.append("Eigenvalue buckling needs geometric fidelity on slender members.")
        mesh.append("Resolve thickness and selected flanges; avoid ultra-coarse survey for claims.")
    elif context.analysis_type == "modal":
        physics.append("Global mass/stiffness distribution drives modes more than tiny local peaks.")
        mesh.append("Prefer mid uniform tet unless local mass attachments are critical.")
    elif context.analysis_type == "impact_crash":
        physics.append("Explicit dynamics / large deformation — wave transit and contact govern size.")
        mesh.append("Smaller elements near impact/contact; coarser far-field to control cost.")
        solver.append("Prefer explicit-capable target (e.g. LS-DYNA) for crash intent.")
    elif context.analysis_type == "thermal":
        physics.append("Temperature gradients follow BC surfaces and conductivity (unknown from STEP).")
        mesh.append("Refine on heated/cooled faces once identified.")

    if context.expects_large_deformation:
        physics.append("Large deformation flagged — distortion control & remesh policy may be needed later.")
    if context.expects_contact:
        physics.append("Contact expected — local sizing on contact faces is first-order.")
    for h in hints:
        mesh.append(f"Feature {h.kind}: {h.label}")
    if refine:
        mesh.append(f"Active refine regions: {', '.join(refine)}")

    if context.solver_target == "ansys_mechanical":
        solver.append("ANSYS Mechanical path: tet OK for DEMO; hex/sweep remain future.")
    elif context.solver_target == "ls_dyna":
        solver.append("LS-DYNA: watch element size vs timestep; local refine carefully.")
    elif context.solver_target == "abaqus":
        solver.append("Abaqus: tet acceptable for DEMO solid; C3D10 aspirational later.")
    else:
        solver.append(f"Target solver '{context.solver_target}' — generic tet export only in M1.")

    if context.analysis_type == "impact_crash" and context.solver_target not in {
        "ls_dyna",
        "generic_tet",
    }:
        solver.append("Mismatch risk: crash intent vs non-explicit solver target.")

    return tuple(physics), tuple(mesh), tuple(solver)


def _quality_targets(context: AnalysisContext) -> tuple[QualityTarget, ...]:
    # DEMO geometric gates — not solver validation
    aspect = 40.0 if context.analysis_type == "impact_crash" else 50.0
    return (
        QualityTarget(
            metric="max_aspect_ratio",
            op="le",
            threshold=aspect,
            units="1",
            why="Limit extreme tet stretching for DEMO geometric health.",
        ),
        QualityTarget(
            metric="min_tet_volume",
            op="gt",
            threshold=0.0,
            units="m^3",
            why="Reject inverted/zero-volume elements.",
        ),
        QualityTarget(
            metric="positive_volume_fraction",
            op="ge",
            threshold=0.5,
            units="1",
            why="Orientation health proxy.",
        ),
    )


def _method_plans(
    context: AnalysisContext,
    char: float,
    feature_len: float | None,
    refine: tuple[str, ...],
    geometry: GeometryModel,
) -> tuple[MeshMethodPlan, tuple[MeshMethodPlan, ...]]:
    dx = geometry.bbox_max.x - geometry.bbox_min.x
    dy = geometry.bbox_max.y - geometry.bbox_min.y
    dz = geometry.bbox_max.z - geometry.bbox_min.z
    thickness = min(dx, dy, dz)

    # Through-thickness policy for thin solids
    t_elems = None
    if thickness / max(max(dx, dy, dz), 1e-9) < 0.15:
        t_elems = 2 if context.analysis_type in {"modal", "static_structural"} else 3
        if context.analysis_type in {"buckling", "impact_crash"}:
            t_elems = 3

    hole_elems = 12 if feature_len else None
    if context.analysis_type == "impact_crash" and feature_len:
        hole_elems = 16

    def size_from_policy(global_div: float, local_div: float | None) -> tuple[float, float | None]:
        g = max(char / global_div, char * (0.12 / global_div))
        # Feature-based local size: aim ~N elements across hole diameter
        local = None
        if local_div is not None and refine:
            local = max(char / local_div, char * 0.02)
            if feature_len and hole_elems:
                local = min(local, feature_len / hole_elems)
            if t_elems:
                local = min(local, thickness / t_elems)
        elif t_elems and not refine:
            # Still respect thickness somewhat in global size
            g = min(g, thickness / max(t_elems - 0.5, 1))
        return g, local

    at = context.analysis_type
    if at == "impact_crash":
        g, local = size_from_policy(12.0, 24.0)
        primary = MeshMethodPlan(
            method_id="crash-local-explicit",
            global_size_m=g,
            local_size_m=local if refine else g * 0.7,
            refine_region_ids=refine,
            through_thickness_elements=t_elems,
            elements_around_hole=hole_elems,
            notes="Explicit-style sizing: protect contact/impact zones; control far-field cost.",
        )
        g2, _ = size_from_policy(16.0, None)
        alts = (
            MeshMethodPlan(
                method_id="crash-uniform-fine",
                global_size_m=g2,
                local_size_m=None,
                refine_region_ids=(),
                through_thickness_elements=t_elems,
                elements_around_hole=None,
                notes="Uniform fine — expensive baseline for comparison.",
            ),
        )
    elif at == "buckling":
        g, local = size_from_policy(8.0, 16.0)
        primary = MeshMethodPlan(
            method_id="buckling-flange-aware",
            global_size_m=g,
            local_size_m=local,
            refine_region_ids=refine,
            through_thickness_elements=t_elems or 3,
            elements_around_hole=hole_elems,
            notes="Resolve slender directions; refine selected flanges/holes.",
        )
        g2, _ = size_from_policy(4.0, None)
        alts = (
            MeshMethodPlan(
                method_id="buckling-survey",
                global_size_m=g2,
                local_size_m=None,
                refine_region_ids=(),
                through_thickness_elements=2,
                elements_around_hole=None,
                notes="Survey only — not for eigenvalue acceptance.",
            ),
        )
    elif at == "thermal":
        g, local = size_from_policy(8.0, 20.0)
        primary = MeshMethodPlan(
            method_id="thermal-bc-gradient",
            global_size_m=g,
            local_size_m=local,
            refine_region_ids=refine,
            through_thickness_elements=t_elems,
            elements_around_hole=hole_elems,
            notes="Gradient capture near thermal BC faces when known.",
        )
        g2, _ = size_from_policy(10.0, None)
        alts = (
            MeshMethodPlan(
                method_id="thermal-uniform",
                global_size_m=g2,
                local_size_m=None,
                refine_region_ids=(),
                through_thickness_elements=t_elems,
                elements_around_hole=None,
                notes="Uniform when BC faces unknown.",
            ),
        )
    elif at == "modal":
        g, _ = size_from_policy(8.0, None)
        primary = MeshMethodPlan(
            method_id="modal-uniform-mid",
            global_size_m=g,
            local_size_m=None,
            refine_region_ids=(),
            through_thickness_elements=t_elems,
            elements_around_hole=None,
            notes="Uniform mid density — modes are global.",
        )
        g2, _ = size_from_policy(14.0, None)
        alts = (
            MeshMethodPlan(
                method_id="modal-fine",
                global_size_m=g2,
                local_size_m=None,
                refine_region_ids=(),
                through_thickness_elements=t_elems,
                elements_around_hole=None,
                notes="Finer uniform for higher-mode interest.",
            ),
        )
    else:  # static_structural
        g, local = size_from_policy(8.0, 18.0)
        primary = MeshMethodPlan(
            method_id="static-hole-aware",
            global_size_m=g,
            local_size_m=local,
            refine_region_ids=refine,
            through_thickness_elements=t_elems,
            elements_around_hole=hole_elems or (12 if refine else None),
            notes=(
                "Static stress method: global fill + local refine on holes/fillets/contact. "
                + (
                    f"Target ~{hole_elems} elements across feature length."
                    if feature_len and hole_elems
                    else "No feature length — region refine only."
                )
            ),
        )
        g_c, _ = size_from_policy(4.0, None)
        g_f, local_f = size_from_policy(14.0, 28.0)
        alts = (
            MeshMethodPlan(
                method_id="static-coarse-preview",
                global_size_m=g_c,
                local_size_m=None,
                refine_region_ids=(),
                through_thickness_elements=max((t_elems or 2) - 1, 1) if t_elems else 1,
                elements_around_hole=None,
                notes="Preview / assembly fit only.",
            ),
            MeshMethodPlan(
                method_id="static-fine-stress",
                global_size_m=g_f,
                local_size_m=local_f,
                refine_region_ids=refine,
                through_thickness_elements=t_elems,
                elements_around_hole=(hole_elems + 4) if hole_elems else None,
                notes="Finer stress-seeking variant for comparison.",
            ),
        )

    return primary, alts
