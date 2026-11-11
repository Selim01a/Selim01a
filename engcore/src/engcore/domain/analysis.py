"""Analysis context and mesh strategy models.

Engineering boundary: STEP alone cannot decide a correct mesh strategy.
Users must supply analysis type, target solver, and optional physics hints.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

AnalysisType = Literal[
    "static_structural",
    "buckling",
    "modal",
    "impact_crash",
    "thermal",
    "unknown",
]

SolverTarget = Literal[
    "generic_tet",
    "ansys_mechanical",
    "ls_dyna",
    "abaqus",
    "calculix",
]

ElementFamily = Literal["TET4", "TET10", "HEX8", "SHELL"]


@dataclass(frozen=True, slots=True)
class AnalysisContext:
    """User-supplied physics/solver intent — required for mesh decisions."""

    analysis_type: AnalysisType
    solver_target: SolverTarget
    critical_result_regions: tuple[str, ...] = ()
    notes: str = ""
    # Optional physics hints (not inferred from STEP)
    expects_large_deformation: bool = False
    expects_contact: bool = False
    thin_wall_candidate: bool = False


@dataclass(frozen=True, slots=True)
class GeometryRegion:
    """Selectable region. CAD face tags are session-local, not durable IDs."""

    region_id: str
    label: str
    kind: Literal["face", "edge", "volume", "bbox_face"]
    # Optional bbox of region in SI metres for viewer highlighting
    bbox_min: tuple[float, float, float] | None = None
    bbox_max: tuple[float, float, float] | None = None


@dataclass(frozen=True, slots=True)
class MeshStrategy:
    strategy_id: str
    name: str
    element_family: ElementFamily
    global_size_m: float
    local_size_m: float | None
    refine_region_ids: tuple[str, ...]
    rationale: str
    maturity: Literal["DEMO", "APPROVED"] = "DEMO"
    confidence: float = 0.5  # 0..1, DEMO heuristics


@dataclass(frozen=True, slots=True)
class StrategyProposal:
    recommended: MeshStrategy
    alternatives: tuple[MeshStrategy, ...]
    warnings: tuple[str, ...]
    requires_user_context: bool


@dataclass(slots=True)
class MeshVariantResult:
    strategy: MeshStrategy
    mesh_id: str
    n_nodes: int
    n_cells: int
    min_tet_volume: float | None
    max_aspect_ratio: float | None
    overall_rule_status: str
    report_path: str | None = None


@dataclass(slots=True)
class CompareSession:
    geometry_id: str
    context: AnalysisContext
    selected_regions: list[str] = field(default_factory=list)
    variants: list[MeshVariantResult] = field(default_factory=list)
