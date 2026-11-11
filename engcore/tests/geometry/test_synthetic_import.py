from __future__ import annotations

from pathlib import Path

import pytest

from engcore.domain.models import UnitPolicy
from engcore.geometry.synthetic import SyntheticGeometryImporter

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"


def _units(u: str = "m") -> UnitPolicy:
    return UnitPolicy(
        source_unit=u,  # type: ignore[arg-type]
        confirmed_by_user=True,
        scale_to_si=1.0 if u == "m" else 0.001,
    )


def test_import_step_fixture() -> None:
    geo = SyntheticGeometryImporter().import_step(FIXTURES / "unit_cube.step", _units("m"))
    assert geo.is_closed_solid
    assert geo.volume_m3 == pytest.approx(1.0)
    assert geo.backend == "synthetic"
    assert len(geo.source_sha256) == 64


def test_import_json_mm_scales_to_si() -> None:
    geo = SyntheticGeometryImporter().import_step(FIXTURES / "unit_cube.json", _units("mm"))
    assert geo.volume_m3 == pytest.approx(1e-9)
    assert geo.bbox_max.x == pytest.approx(0.001)


def test_open_solid_rejected() -> None:
    with pytest.raises(ValueError, match="closed solid"):
        SyntheticGeometryImporter().import_step(FIXTURES / "open_solid.json", _units())
