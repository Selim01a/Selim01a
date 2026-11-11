from __future__ import annotations

import json
from pathlib import Path

from engcore.domain.analysis import AnalysisContext
from engcore.orchestration.pipeline import run_pipeline
from engcore.reporting.mesh_export import export_meshed_geometry

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"


def test_mesh_export_writes_json_and_vtk(tmp_path: Path) -> None:
    run = run_pipeline(
        FIXTURES / "unit_cube.step",
        tmp_path / "out",
        units="m",
        confirm_units=True,
        max_size_m=0.5,
        context=AnalysisContext(
            analysis_type="static_structural",
            solver_target="generic_tet",
        ),
    )
    export_dir = tmp_path / "export"
    paths = export_meshed_geometry(run, export_dir)
    assert "json" in paths
    assert Path(paths["json"]).exists()
    data = json.loads(Path(paths["json"]).read_text(encoding="utf-8"))
    assert data["schema"] == "engcore.mesh.v1"
    assert data["n_cells"] >= 1
    assert "manifest" in paths
    assert ("vtu" in paths) or ("vtk" in paths) or ("stl" in paths)
    # Pipeline also auto-exports under out/mesh_export
    assert (tmp_path / "out" / "mesh_export" / "mesh.json").exists()


def test_real_step_requires_gmsh_or_succeeds(tmp_path: Path) -> None:
    from engcore.geometry.factory import MissingGmshError, gmsh_available, get_geometry_importer

    # Create a minimal non-synthetic STEP-looking file
    fake = tmp_path / "part.step"
    fake.write_text("ISO-10303-21;\nHEADER;\nENDSEC;\nDATA;\nENDSEC;\nEND-ISO-10303-21;\n")
    if gmsh_available():
        # May fail on invalid STEP content, but must not raise MissingGmshError
        try:
            get_geometry_importer(path=fake)
        except MissingGmshError:
            raise AssertionError("Gmsh is available — MissingGmshError must not fire")
    else:
        import pytest

        with pytest.raises(MissingGmshError):
            get_geometry_importer(path=fake)
