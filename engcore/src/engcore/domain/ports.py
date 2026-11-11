"""Domain ports. Adapters implement these; vendor types stay inside adapters."""

from __future__ import annotations

from pathlib import Path
from typing import Protocol

from engcore.domain.models import (
    ArtifactPaths,
    GeometryModel,
    MeshModel,
    MetricSet,
    PipelineRun,
    RuleDecision,
    UnitPolicy,
)


class GeometryImporter(Protocol):
    def import_step(self, path: Path, unit_policy: UnitPolicy) -> GeometryModel:
        """Import a closed solid STEP (or fixture). Raises on invalid/open solids."""
        ...


class Mesher(Protocol):
    def mesh_tet4(self, geometry: GeometryModel, max_size_m: float = 0.05) -> MeshModel:
        """Produce a TET4 mesh in SI metres. No Gmsh types in return value."""
        ...


class MetricComputer(Protocol):
    def compute(self, mesh: MeshModel) -> MetricSet:
        ...


class RuleEngine(Protocol):
    def evaluate(self, metrics: MetricSet) -> list[RuleDecision]:
        ...


class ReportExporter(Protocol):
    def export(self, run: PipelineRun, out_dir: Path) -> ArtifactPaths:
        ...
