"""Neutral surface preview for the viewer (no OCC types leave this module)."""

from __future__ import annotations

from dataclasses import dataclass

from engcore.domain.models import GeometryModel, Vec3


@dataclass(frozen=True, slots=True)
class TriSurface:
    nodes: tuple[Vec3, ...]
    triangles: tuple[tuple[int, int, int], ...]
    source: str


def preview_surface(geometry: GeometryModel) -> TriSurface:
    """Return a display tessellation. Gmsh when available; else bbox box."""
    if geometry.backend == "gmsh":
        surf = _gmsh_surface(geometry)
        if surf is not None:
            return surf
    return _bbox_surface(geometry)


def _bbox_surface(geometry: GeometryModel) -> TriSurface:
    mn, mx = geometry.bbox_min, geometry.bbox_max
    nodes = (
        Vec3(mn.x, mn.y, mn.z),
        Vec3(mx.x, mn.y, mn.z),
        Vec3(mx.x, mx.y, mn.z),
        Vec3(mn.x, mx.y, mn.z),
        Vec3(mn.x, mn.y, mx.z),
        Vec3(mx.x, mn.y, mx.z),
        Vec3(mx.x, mx.y, mx.z),
        Vec3(mn.x, mx.y, mx.z),
    )
    tris = (
        (0, 1, 2),
        (0, 2, 3),
        (4, 6, 5),
        (4, 7, 6),
        (0, 4, 5),
        (0, 5, 1),
        (1, 5, 6),
        (1, 6, 2),
        (2, 6, 7),
        (2, 7, 3),
        (3, 7, 4),
        (3, 4, 0),
    )
    return TriSurface(nodes=nodes, triangles=tris, source="bbox")


def _gmsh_surface(geometry: GeometryModel) -> TriSurface | None:
    try:
        import gmsh
    except Exception:
        return None
    scale = geometry.unit_policy.scale_to_si
    gmsh.initialize()
    try:
        gmsh.option.setNumber("General.Terminal", 0)
        gmsh.model.add("engcore_preview")
        gmsh.model.occ.importShapes(geometry.source_path)
        gmsh.model.occ.synchronize()
        gmsh.option.setNumber("Mesh.CharacteristicLengthMax", max(_char(geometry) / 8.0, 1e-3))
        gmsh.model.mesh.generate(2)
        node_tags, coords, _ = gmsh.model.mesh.getNodes()
        nodes = [
            Vec3(coords[i] * scale, coords[i + 1] * scale, coords[i + 2] * scale)
            for i in range(0, len(coords), 3)
        ]
        tag_to_idx = {int(t): i for i, t in enumerate(node_tags)}
        tris: list[tuple[int, int, int]] = []
        etypes, _, enodes = gmsh.model.mesh.getElements(2)
        for etype, block in zip(etypes, enodes, strict=False):
            # 2 = 3-node triangle
            if int(etype) != 2:
                continue
            for i in range(0, len(block), 3):
                tris.append(
                    (
                        tag_to_idx[int(block[i])],
                        tag_to_idx[int(block[i + 1])],
                        tag_to_idx[int(block[i + 2])],
                    )
                )
        if not tris:
            return None
        return TriSurface(nodes=tuple(nodes), triangles=tuple(tris), source="gmsh")
    except Exception:
        return None
    finally:
        gmsh.finalize()


def _char(geometry: GeometryModel) -> float:
    dx = geometry.bbox_max.x - geometry.bbox_min.x
    dy = geometry.bbox_max.y - geometry.bbox_min.y
    dz = geometry.bbox_max.z - geometry.bbox_min.z
    return max(min(dx, dy, dz), 1e-6)
