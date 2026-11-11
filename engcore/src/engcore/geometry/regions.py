"""List selectable geometry regions. CAD tags are session-local only."""

from __future__ import annotations

from pathlib import Path

from engcore.domain.analysis import GeometryRegion
from engcore.domain.models import GeometryModel
from engcore.standards.mesh_advisor import MeshStrategyAdvisor


def list_regions(geometry: GeometryModel) -> tuple[GeometryRegion, ...]:
    """Prefer CAD faces (Gmsh/OCC or fixture metadata); else bbox faces."""
    if geometry.backend == "gmsh":
        faces = _gmsh_faces(geometry)
        if faces:
            return faces
    fixture_faces = _fixture_faces(geometry)
    if fixture_faces:
        return fixture_faces
    return MeshStrategyAdvisor().default_regions(geometry)


def _fixture_faces(geometry: GeometryModel) -> tuple[GeometryRegion, ...]:
    path = Path(geometry.source_path)
    if path.suffix.lower() != ".json" or not path.exists():
        return ()
    import json

    data = json.loads(path.read_text(encoding="utf-8"))
    faces = data.get("faces") or []
    scale = geometry.unit_policy.scale_to_si
    out: list[GeometryRegion] = []
    for f in faces:
        bmin = f.get("bbox_min")
        bmax = f.get("bbox_max")
        out.append(
            GeometryRegion(
                region_id=str(f["id"]),
                label=str(f.get("label", f["id"])),
                kind="face",
                bbox_min=tuple(float(x) * scale for x in bmin) if bmin else None,  # type: ignore[arg-type]
                bbox_max=tuple(float(x) * scale for x in bmax) if bmax else None,  # type: ignore[arg-type]
            )
        )
    return tuple(out)


def _gmsh_faces(geometry: GeometryModel) -> tuple[GeometryRegion, ...]:
    try:
        import gmsh
    except Exception:
        return ()

    path = geometry.source_path
    scale = geometry.unit_policy.scale_to_si
    gmsh.initialize()
    try:
        gmsh.option.setNumber("General.Terminal", 0)
        gmsh.model.add("engcore_faces")
        gmsh.model.occ.importShapes(path)
        gmsh.model.occ.synchronize()
        faces = gmsh.model.getEntities(2)
        out: list[GeometryRegion] = []
        for _dim, tag in faces:
            xmin, ymin, zmin, xmax, ymax, zmax = gmsh.model.getBoundingBox(2, tag)
            # Session-local id — NOT a durable CAD persistent id
            rid = f"cad-face-{tag}"
            out.append(
                GeometryRegion(
                    region_id=rid,
                    label=f"CAD face {tag}",
                    kind="face",
                    bbox_min=(xmin * scale, ymin * scale, zmin * scale),
                    bbox_max=(xmax * scale, ymax * scale, zmax * scale),
                )
            )
        return tuple(out)
    except Exception:
        return ()
    finally:
        gmsh.finalize()
