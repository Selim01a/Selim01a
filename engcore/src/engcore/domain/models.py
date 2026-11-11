"""Neutral domain models. No Gmsh/OCC/VTK types allowed here."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Literal


@dataclass(frozen=True, slots=True)
class Vec3:
    x: float
    y: float
    z: float

    def as_tuple(self) -> tuple[float, float, float]:
        return (self.x, self.y, self.z)


@dataclass(frozen=True, slots=True)
class Tet4:
    n0: int
    n1: int
    n2: int
    n3: int

    def as_tuple(self) -> tuple[int, int, int, int]:
        return (self.n0, self.n1, self.n2, self.n3)


@dataclass(frozen=True, slots=True)
class Tri3:
    """Linear triangle — surface mesh on selected faces."""

    n0: int
    n1: int
    n2: int

    def as_tuple(self) -> tuple[int, int, int]:
        return (self.n0, self.n1, self.n2)


@dataclass(frozen=True, slots=True)
class UnitPolicy:
    """SI metres inside core. Display may use mm."""

    source_unit: Literal["m", "mm", "unknown"]
    confirmed_by_user: bool
    scale_to_si: float  # multiply source lengths by this to get metres

    def require_confirmed(self) -> None:
        if not self.confirmed_by_user:
            raise ValueError(
                "Unit confirmation required before import. "
                "Pass --units m|mm and acknowledge source units explicitly."
            )
        if self.source_unit == "unknown":
            raise ValueError("Cannot proceed with unknown source units.")


@dataclass(frozen=True, slots=True)
class GeometryModel:
    solid_id: str
    bbox_min: Vec3
    bbox_max: Vec3
    volume_m3: float
    is_closed_solid: bool
    unit_policy: UnitPolicy
    source_sha256: str
    source_path: str
    backend: Literal["synthetic", "gmsh"] = "synthetic"


@dataclass(frozen=True, slots=True)
class MeshModel:
    mesh_id: str
    nodes: tuple[Vec3, ...]
    cells: tuple[Tet4, ...] | tuple[Tri3, ...]
    geometry_ref: str
    backend: Literal["synthetic", "gmsh"]
    element_type: Literal["TET4", "TRI3"] = "TET4"
    strategy_id: str | None = None
    # Faces this mesh was driven by (surface mesh or local refine targets)
    target_region_ids: tuple[str, ...] = ()
    size_m: float | None = None

    @property
    def n_nodes(self) -> int:
        return len(self.nodes)

    @property
    def n_cells(self) -> int:
        return len(self.cells)


@dataclass(frozen=True, slots=True)
class MetricValue:
    name: str
    value: float
    units: str
    description: str = ""


@dataclass(frozen=True, slots=True)
class MetricSet:
    mesh_ref: str
    metrics: tuple[MetricValue, ...]

    def get(self, name: str) -> MetricValue | None:
        for m in self.metrics:
            if m.name == name:
                return m
        return None


class RuleStatus(str, Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    NOT_APPLICABLE = "NOT_APPLICABLE"
    ERROR = "ERROR"


@dataclass(frozen=True, slots=True)
class RuleDecision:
    rule_id: str
    version: str
    metric: str
    observed: float | None
    threshold: float | None
    units: str
    status: RuleStatus
    evidence: str
    maturity: Literal["DEMO", "APPROVED"]


@dataclass(frozen=True, slots=True)
class ArtifactPaths:
    report_json: str
    mesh_json: str
    run_dir: str


@dataclass(slots=True)
class PipelineRun:
    run_id: str
    geometry: GeometryModel
    mesh: MeshModel
    metrics: MetricSet
    decisions: list[RuleDecision] = field(default_factory=list)
    artifacts: ArtifactPaths | None = None

    def overall_status(self) -> str:
        if any(d.status == RuleStatus.ERROR for d in self.decisions):
            return "ERROR"
        if any(d.status == RuleStatus.FAIL for d in self.decisions):
            return "FAIL"
        if not self.decisions:
            return "NO_RULES"
        if all(
            d.status in (RuleStatus.PASS, RuleStatus.NOT_APPLICABLE) for d in self.decisions
        ):
            return "PASS"
        return "MIXED"
