"""Deterministic synthetic STEP/fixture importer (no vendor types)."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from engcore.domain.models import GeometryModel, UnitPolicy, Vec3


class SyntheticGeometryImporter:
    """Reads JSON fixture describing a closed unit solid (project-owned)."""

    def import_step(self, path: Path, unit_policy: UnitPolicy) -> GeometryModel:
        unit_policy.require_confirmed()
        path = Path(path)
        if not path.exists():
            raise FileNotFoundError(f"Geometry fixture not found: {path}")

        raw = path.read_bytes()
        digest = hashlib.sha256(raw).hexdigest()

        if path.suffix.lower() in {".json", ".fixture.json"}:
            data = json.loads(raw.decode("utf-8"))
        elif path.suffix.lower() in {".step", ".stp"}:
            # Minimal STEP text fixture: parse simple UNIT_CUBE marker + size.
            text = raw.decode("utf-8", errors="replace")
            data = _parse_minimal_step_fixture(text)
        else:
            raise ValueError(f"Unsupported geometry format: {path.suffix}")

        if not data.get("is_closed_solid", False):
            raise ValueError(
                "Import rejected: solid is not a closed solid. "
                "Cannot PASS quality rules on invalid geometry."
            )

        scale = unit_policy.scale_to_si
        bbox_min = data["bbox_min"]
        bbox_max = data["bbox_max"]
        volume = float(data["volume"]) * (scale**3)

        return GeometryModel(
            solid_id=str(data.get("solid_id", "synthetic-solid")),
            bbox_min=Vec3(
                float(bbox_min[0]) * scale,
                float(bbox_min[1]) * scale,
                float(bbox_min[2]) * scale,
            ),
            bbox_max=Vec3(
                float(bbox_max[0]) * scale,
                float(bbox_max[1]) * scale,
                float(bbox_max[2]) * scale,
            ),
            volume_m3=volume,
            is_closed_solid=True,
            unit_policy=unit_policy,
            source_sha256=digest,
            source_path=str(path.resolve()),
            backend="synthetic",
        )


def _parse_minimal_step_fixture(text: str) -> dict:
    """Parse a tiny ASCII STEP-like fixture used in CI (not a full STEP parser)."""
    if "ENGCORE_SYNTHETIC_UNIT_CUBE" not in text:
        raise ValueError(
            "STEP file is not a recognized ENGCORE synthetic fixture and Gmsh is not active. "
            "Use a fixture JSON or install optional gmsh backend."
        )
    # Default 1.0 in source units
    size = 1.0
    for line in text.splitlines():
        if line.strip().startswith("SIZE"):
            size = float(line.split()[1])
            break
    return {
        "solid_id": "unit-cube",
        "is_closed_solid": True,
        "bbox_min": [0.0, 0.0, 0.0],
        "bbox_max": [size, size, size],
        "volume": size**3,
    }
