"""Mesh size recommendations from published FEA practice (DEMO encoding).

Primary citations (see docs/MESH_SIZING.md):
- Autodesk Fusion Mesh quality (through-thickness: 4 linear / 2 parabolic)
- ICEMM structural mesh-size guidance
- MSC Nastran mesh-density notes (refine at steep gradients / holes)
- NAFEMS: converge the quantity of interest
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from engcore.domain.analysis import AnalysisContext, GeometryRegion
from engcore.domain.models import GeometryModel
from engcore.geometry.features import FeatureHint

ElementChoice = Literal["TRI3", "TET4"]


@dataclass(frozen=True, slots=True)
class MeshSizePlan:
    element_type: ElementChoice
    global_size_m: float
    local_size_m: float | None
    through_thickness_target: int | None
    elements_around_feature: int | None
    rationale: str
    citations: tuple[str, ...]


def characteristic_length_m(geometry: GeometryModel) -> float:
    dx = geometry.bbox_max.x - geometry.bbox_min.x
    dy = geometry.bbox_max.y - geometry.bbox_min.y
    dz = geometry.bbox_max.z - geometry.bbox_min.z
    return max(min(dx, dy, dz), 1e-6)


def thickness_m(geometry: GeometryModel) -> float:
    return characteristic_length_m(geometry)


def recommend_sizes(
    geometry: GeometryModel,
    context: AnalysisContext,
    *,
    element_type: ElementChoice = "TET4",
    feature_hints: tuple[FeatureHint, ...] = (),
    regions: tuple[GeometryRegion, ...] = (),
    selected_region_ids: tuple[str, ...] = (),
    user_global_size_m: float | None = None,
    user_local_size_m: float | None = None,
) -> MeshSizePlan:
    """Return DEMO sizes. User overrides win when provided."""
    char = characteristic_length_m(geometry)
    thick = thickness_m(geometry)
    feature_len = _min_feature_length(feature_hints, regions)

    # Autodesk/ICEMM through-thickness policy for linear solids
    t_elems: int | None = None
    if context.thin_wall_candidate or thick / max(char * 4, 1e-9) < 1.0:
        if context.analysis_type in {"buckling", "impact_crash"} or context.thin_wall_candidate:
            t_elems = 4  # linear tet target through thickness (Autodesk)
        elif context.analysis_type == "static_structural":
            t_elems = 4 if context.expects_contact else 3

    hole_n = 12 if feature_len else None
    if context.analysis_type == "impact_crash" and feature_len:
        hole_n = 16

    # Global defaults by analysis (MSC: denser near gradients → local; global moderate)
    div = {
        "impact_crash": 12.0,
        "buckling": 8.0,
        "thermal": 8.0,
        "modal": 8.0,
        "static_structural": 8.0,
    }.get(context.analysis_type, 8.0)
    global_size = char / div
    if t_elems:
        global_size = min(global_size, thick / t_elems)

    local = None
    if selected_region_ids or feature_len:
        local = global_size * 0.5
        if feature_len and hole_n:
            local = min(local, feature_len / hole_n)
        if t_elems:
            local = min(local, thick / t_elems)

    if user_global_size_m is not None and user_global_size_m > 0:
        global_size = user_global_size_m
    if user_local_size_m is not None and user_local_size_m > 0:
        local = user_local_size_m

    if element_type == "TRI3":
        # Surface mesh: size is the sole driver on selected faces
        size = user_local_size_m or user_global_size_m or local or global_size
        rationale = (
            f"Surface TRI3 on selected faces at size={size:.4g} m. "
            "Refine where gradients/contact are expected (MSC/NAFEMS practice)."
        )
        return MeshSizePlan(
            element_type="TRI3",
            global_size_m=size,
            local_size_m=size,
            through_thickness_target=None,
            elements_around_feature=hole_n,
            rationale=rationale,
            citations=_citations(),
        )

    rationale = (
        f"Volume TET4 global={global_size:.4g} m"
        + (f", local={local:.4g} m on selected faces" if local else "")
        + (f", through-thickness target≈{t_elems} (Autodesk linear rule)" if t_elems else "")
        + "."
    )
    return MeshSizePlan(
        element_type="TET4",
        global_size_m=global_size,
        local_size_m=local,
        through_thickness_target=t_elems,
        elements_around_feature=hole_n,
        rationale=rationale,
        citations=_citations(),
    )


def _citations() -> tuple[str, ...]:
    return (
        "Autodesk Fusion — Mesh quality (through-thickness / aspect ratio)",
        "ICEMM — FEM mesh size definition in structural analysis",
        "MSC Nastran — mesh density at stress gradients / holes",
        "NAFEMS — converge QoI (e.g. plate-with-hole Kt)",
    )


def _min_feature_length(
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
            sx = abs(r.bbox_max[0] - r.bbox_min[0])
            sy = abs(r.bbox_max[1] - r.bbox_min[1])
            sz = abs(r.bbox_max[2] - r.bbox_min[2])
            dims = sorted([sx, sy, sz])
            lengths.append(max(dims[0], 1e-6))
    return min(lengths) if lengths else None
