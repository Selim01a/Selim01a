"""Guided mesh automation — user supplies analysis intent; software does the rest.

Mirrors industry preprocess automation (Ansys mesh workflow / NAFEMS process
automation): fixed step sequence with visible outcomes, user can still override.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Callable, Literal

from engcore.domain.analysis import AnalysisContext, MeshStrategy
from engcore.domain.case_brief import AnalysisCaseBrief
from engcore.domain.models import GeometryModel, MeshModel, PipelineRun
from engcore.geometry.features import FeatureHint, detect_feature_hints
from engcore.geometry.regions import list_regions
from engcore.domain.analysis import GeometryRegion
from engcore.meshing.factory import get_mesher
from engcore.orchestration.pipeline import (
    interpret_analysis_case,
    propose_strategies,
    run_with_strategy,
)
from engcore.reporting.mesh_export import export_mesh_model, export_meshed_geometry
from engcore.standards.mesh_sizing import MeshSizePlan, recommend_sizes

StepId = Literal[
    "detect_features",
    "select_faces",
    "recommend_size",
    "generate_mesh",
    "export",
    "done",
]

StepStatus = Literal["pending", "running", "done", "skipped", "error"]

ProgressCb = Callable[[StepId, StepStatus, str], None]


@dataclass(slots=True)
class AutomationStep:
    step_id: StepId
    label: str
    status: StepStatus = "pending"
    detail: str = ""


@dataclass(slots=True)
class AutomationResult:
    geometry: GeometryModel
    regions: tuple[GeometryRegion, ...]
    features: tuple[FeatureHint, ...]
    selected_faces: tuple[str, ...]
    brief: AnalysisCaseBrief | None
    size_plan: MeshSizePlan
    mesh: MeshModel
    run: PipelineRun | None
    export_paths: dict[str, str]
    steps: list[AutomationStep] = field(default_factory=list)
    out_dir: Path | None = None


def default_steps() -> list[AutomationStep]:
    return [
        AutomationStep("detect_features", "Özellik tespit (delik / ince duvar)"),
        AutomationStep("select_faces", "Kritik yüzeyleri seç"),
        AutomationStep("recommend_size", "Kaynaklı mesh size öner"),
        AutomationStep("generate_mesh", "Mesh üret"),
        AutomationStep("export", "Meshli geometriyi dışa aktar"),
        AutomationStep("done", "Tamam"),
    ]


def auto_select_faces(
    regions: tuple[GeometryRegion, ...],
    features: tuple[FeatureHint, ...],
) -> tuple[str, ...]:
    """Prefer feature-related faces; else all faces (user can deselect later)."""
    selected: list[str] = []
    for f in features:
        if f.kind in {"hole", "fillet_candidate", "thin_wall"}:
            selected.extend(f.related_region_ids)
    selected = list(dict.fromkeys(selected))
    if selected:
        return tuple(selected)
    # No features: pick nothing for TRI3 (must be explicit); for volume caller may use all
    return ()


def run_mesh_automation(
    geometry: GeometryModel,
    context: AnalysisContext,
    *,
    element_type: Literal["TRI3", "TET4"] = "TRI3",
    out_root: Path | None = None,
    user_global_size_m: float | None = None,
    user_local_size_m: float | None = None,
    selected_faces: tuple[str, ...] | None = None,
    progress: ProgressCb | None = None,
) -> AutomationResult:
    """Run the standard preprocess automation on an already-imported solid."""

    steps = default_steps()
    step_map = {s.step_id: s for s in steps}

    def _emit(sid: StepId, status: StepStatus, detail: str = "") -> None:
        s = step_map[sid]
        s.status = status
        s.detail = detail
        if progress:
            progress(sid, status, detail)

    # 1 Detect
    _emit("detect_features", "running")
    regions = list_regions(geometry)
    features = detect_feature_hints(geometry, tuple(r.region_id for r in regions))
    _emit(
        "detect_features",
        "done",
        f"{len(features)} özellik · {len(regions)} yüzey",
    )

    # 2 Select faces
    _emit("select_faces", "running")
    faces = selected_faces if selected_faces is not None else auto_select_faces(regions, features)
    if element_type == "TRI3" and not faces:
        # Surface automation needs at least one face — fall back to all
        faces = tuple(r.region_id for r in regions)
        detail = f"Özellik yok → tüm yüzeyler ({len(faces)})"
    else:
        detail = f"{len(faces)} yüzey seçildi"
    _emit("select_faces", "done", detail)

    # 3 Size
    _emit("recommend_size", "running")
    size_plan = recommend_sizes(
        geometry,
        context,
        element_type=element_type,
        feature_hints=features,
        regions=regions,
        selected_region_ids=faces,
        user_global_size_m=user_global_size_m,
        user_local_size_m=user_local_size_m,
    )
    brief = interpret_analysis_case(
        geometry,
        context,
        regions=regions,
        feature_hints=features,
        selected_regions=faces,
    )
    _emit("recommend_size", "done", size_plan.rationale[:120])

    # 4 Mesh
    _emit("generate_mesh", "running")
    out_root = Path(out_root or Path.home() / "ENGINEERING_CORE_runs")
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_dir = out_root / f"auto_{stamp}_{element_type.lower()}"
    out_dir.mkdir(parents=True, exist_ok=True)

    run: PipelineRun | None = None
    if element_type == "TRI3":
        # Prefer Gmsh only for gmsh-backed STEP; fixtures use synthetic face grids
        mesher = get_mesher(
            prefer_gmsh=(geometry.backend == "gmsh"),
            geometry=geometry,
        )
        size = size_plan.local_size_m or size_plan.global_size_m
        try:
            mesh = mesher.mesh_surface_tri3(  # type: ignore[attr-defined]
                geometry,
                face_region_ids=faces,
                size_m=size,
                regions=regions,
            )
        except TypeError:
            mesh = mesher.mesh_surface_tri3(  # type: ignore[attr-defined]
                geometry, face_region_ids=faces, size_m=size
            )
        _emit("generate_mesh", "done", f"TRI3 · {mesh.n_cells} eleman · size={size:.4g} m")
    else:
        proposal = propose_strategies(
            geometry,
            context,
            faces,
            feature_hints=features,
            regions=regions,
            brief=brief,
        )
        strategy = MeshStrategy(
            strategy_id=proposal.recommended.strategy_id,
            name=proposal.recommended.name,
            element_family="TET4",
            global_size_m=size_plan.global_size_m,
            local_size_m=size_plan.local_size_m,
            refine_region_ids=faces,
            rationale=size_plan.rationale,
            confidence=proposal.recommended.confidence,
        )
        run, _review = run_with_strategy(
            geometry, strategy, out_dir, prefer_gmsh=True, brief=brief
        )
        mesh = run.mesh
        _emit(
            "generate_mesh",
            "done",
            f"TET4 · {mesh.n_cells} eleman · global={size_plan.global_size_m:.4g} m",
        )

    # 5 Export
    _emit("export", "running")
    if run is not None:
        paths = export_meshed_geometry(run, out_dir / "mesh_export")
    else:
        paths = export_mesh_model(mesh, out_dir / "mesh_export")
        # lightweight manifest
        paths["manifest"] = paths.get("json", "")
    _emit("export", "done", str(out_dir / "mesh_export"))
    _emit("done", "done", "Otomasyon tamam")

    return AutomationResult(
        geometry=geometry,
        regions=regions,
        features=features,
        selected_faces=faces,
        brief=brief,
        size_plan=size_plan,
        mesh=mesh,
        run=run,
        export_paths=paths,
        steps=steps,
        out_dir=out_dir,
    )
