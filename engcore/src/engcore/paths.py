"""Resource path helpers — works from source, editable install, and PyInstaller."""

from __future__ import annotations

import sys
from pathlib import Path


def _meipass() -> Path | None:
    if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
        return Path(sys._MEIPASS)  # type: ignore[attr-defined]
    return None


def fixture_dir() -> Path:
    candidates = [
        Path(__file__).resolve().parent / "data" / "fixtures",
    ]
    mei = _meipass()
    if mei is not None:
        candidates.extend(
            [
                mei / "engcore" / "data" / "fixtures",
                mei / "data" / "fixtures",
            ]
        )
    # Dev fallback: repo tests/fixtures
    candidates.append(Path(__file__).resolve().parents[2] / "tests" / "fixtures")

    for path in candidates:
        if path.exists():
            return path
    return candidates[0]


def default_output_dir() -> Path:
    home = Path.home() / "ENGINEERING_CORE_runs"
    home.mkdir(parents=True, exist_ok=True)
    return home
