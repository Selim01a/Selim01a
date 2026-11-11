from __future__ import annotations

import json
from pathlib import Path

import pytest

from engcore.cli import main
from engcore.orchestration.pipeline import run_pipeline

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"


def test_pipeline_unit_cube(tmp_path: Path) -> None:
    run = run_pipeline(
        FIXTURES / "unit_cube.step",
        tmp_path / "out",
        units="m",
        confirm_units=True,
        max_size_m=0.5,
    )
    assert run.artifacts is not None
    report = json.loads(Path(run.artifacts.report_json).read_text(encoding="utf-8"))
    assert report["overall_status"] in {"PASS", "FAIL", "MIXED"}
    assert report["geometry"]["source_sha256"]
    assert "disclaimer" in report
    mesh = json.loads(Path(run.artifacts.mesh_json).read_text(encoding="utf-8"))
    assert mesh["element_type"] == "TET4"
    assert len(mesh["cells"]) >= 1


def test_cli_fixture_smoke(tmp_path: Path, capsys: pytest.CaptureFixture[str]) -> None:
    code = main(
        [
            "run",
            "--fixture",
            "unit-cube",
            "--out",
            str(tmp_path / "cli-out"),
            "--confirm-units",
            "--units",
            "m",
        ]
    )
    captured = capsys.readouterr()
    assert code == 0
    summary = json.loads(captured.out)
    assert summary["overall_status"] in {"PASS", "MIXED"}
    assert Path(summary["report"]).exists()


def test_cli_rejects_without_unit_confirm(tmp_path: Path) -> None:
    code = main(
        [
            "run",
            "--fixture",
            "unit-cube",
            "--out",
            str(tmp_path / "cli-out"),
            "--units",
            "m",
        ]
    )
    assert code == 2


def test_open_solid_does_not_pass(tmp_path: Path) -> None:
    with pytest.raises(ValueError, match="closed solid"):
        run_pipeline(
            FIXTURES / "open_solid.json",
            tmp_path / "out",
            units="m",
            confirm_units=True,
        )
