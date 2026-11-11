"""Interpreted analysis-case brief — engineering narrative for meshing decisions."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal


@dataclass(frozen=True, slots=True)
class QualityTarget:
    metric: str
    op: Literal["le", "ge", "lt", "gt"]
    threshold: float
    units: str
    why: str


@dataclass(frozen=True, slots=True)
class MeshMethodPlan:
    """Sizing method derived from the interpreted case (DEMO)."""

    method_id: str
    global_size_m: float
    local_size_m: float | None
    refine_region_ids: tuple[str, ...]
    through_thickness_elements: int | None
    elements_around_hole: int | None
    notes: str


@dataclass(frozen=True, slots=True)
class AnalysisCaseBrief:
    """Human-readable + machine-usable interpretation of the analysis case."""

    title: str
    summary: str
    physics_drivers: tuple[str, ...]
    mesh_drivers: tuple[str, ...]
    missing_inputs: tuple[str, ...]
    solver_notes: tuple[str, ...]
    feature_length_m: float | None
    characteristic_length_m: float
    quality_targets: tuple[QualityTarget, ...]
    primary_method: MeshMethodPlan
    alternate_methods: tuple[MeshMethodPlan, ...]
    confidence: float
    maturity: Literal["DEMO"] = "DEMO"


@dataclass(slots=True)
class CaseMeshReview:
    brief_title: str
    method_id: str
    target_results: list[dict] = field(default_factory=list)
    narrative: str = ""
    overall: Literal["MEETS_DEMO_TARGETS", "MIXED", "MISSES_TARGETS", "INCOMPLETE"] = "INCOMPLETE"
