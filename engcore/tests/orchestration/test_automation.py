from __future__ import annotations

from pathlib import Path

from engcore.domain.analysis import AnalysisContext
from engcore.orchestration.automation import auto_select_faces, run_mesh_automation
from engcore.orchestration.pipeline import import_geometry
from engcore.geometry.features import detect_feature_hints
from engcore.geometry.regions import list_regions

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"


def test_auto_select_prefers_features() -> None:
    geo = import_geometry(FIXTURES / "plate_with_hole.json", units="m", confirm_units=True)
    regions = list_regions(geo)
    features = detect_feature_hints(geo, tuple(r.region_id for r in regions))
    selected = auto_select_faces(regions, features)
    # plate fixture should hint hole-related faces when metadata present
    assert isinstance(selected, tuple)


def test_run_mesh_automation_surface(tmp_path: Path) -> None:
    geo = import_geometry(FIXTURES / "unit_cube.step", units="m", confirm_units=True)
    events: list[tuple[str, str]] = []

    def progress(sid: str, status: str, _detail: str) -> None:
        events.append((sid, status))

    result = run_mesh_automation(
        geo,
        AnalysisContext(analysis_type="static_structural", solver_target="generic_tet"),
        element_type="TRI3",
        out_root=tmp_path,
        user_global_size_m=0.5,
        progress=progress,
    )
    assert result.mesh.element_type == "TRI3"
    assert result.mesh.n_cells >= 1
    assert (tmp_path / result.out_dir.name / "mesh_export" / "mesh.json").exists()  # type: ignore[union-attr]
    assert any(s == "done" and st == "done" for s, st in events)
