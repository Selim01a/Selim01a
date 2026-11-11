"""DEMO geometric feature hints. Not certified feature recognition."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

from engcore.domain.models import GeometryModel

FeatureKind = Literal["hole", "fillet_candidate", "sharp_edge_cluster", "thin_wall"]


@dataclass(frozen=True, slots=True)
class FeatureHint:
    feature_id: str
    kind: FeatureKind
    label: str
    confidence: float
    related_region_ids: tuple[str, ...]
    evidence: str
    maturity: Literal["DEMO"] = "DEMO"


def detect_feature_hints(
    geometry: GeometryModel,
    region_ids: tuple[str, ...] = (),
) -> tuple[FeatureHint, ...]:
    hints: list[FeatureHint] = []

    # 1) Fixture-declared features (deterministic DEMO)
    path = Path(geometry.source_path)
    if path.suffix.lower() == ".json" and path.exists():
        data = json.loads(path.read_text(encoding="utf-8"))
        for i, feat in enumerate(data.get("features") or []):
            hints.append(
                FeatureHint(
                    feature_id=str(feat.get("id", f"feat-{i}")),
                    kind=feat.get("kind", "hole"),  # type: ignore[arg-type]
                    label=str(feat.get("label", feat.get("kind", "feature"))),
                    confidence=float(feat.get("confidence", 0.6)),
                    related_region_ids=tuple(feat.get("region_ids") or ()),
                    evidence=str(feat.get("evidence", "Declared in fixture metadata.")),
                )
            )

    # 2) BBox aspect heuristics
    dx = geometry.bbox_max.x - geometry.bbox_min.x
    dy = geometry.bbox_max.y - geometry.bbox_min.y
    dz = geometry.bbox_max.z - geometry.bbox_min.z
    dims = sorted([dx, dy, dz])
    if dims[0] > 0 and dims[2] / dims[0] >= 8.0:
        hints.append(
            FeatureHint(
                feature_id="thin-wall-aspect",
                kind="thin_wall",
                label="Thin-wall aspect ratio",
                confidence=0.45,
                related_region_ids=(),
                evidence=(
                    f"BBox aspect {dims[2]/dims[0]:.1f}:1 suggests shell/hybrid consideration "
                    "(DEMO heuristic from extents only)."
                ),
            )
        )

    # 3) Many CAD faces → possible fillets/details (Gmsh path)
    if geometry.backend == "gmsh" and len(region_ids) >= 12:
        hints.append(
            FeatureHint(
                feature_id="detail-face-count",
                kind="fillet_candidate",
                label="High face count (detail/fillet candidate)",
                confidence=0.35,
                related_region_ids=region_ids[:8],
                evidence=(
                    f"{len(region_ids)} session faces detected — may include fillets/chamfers; "
                    "not a classified topology recognition."
                ),
            )
        )

    return tuple(hints)
