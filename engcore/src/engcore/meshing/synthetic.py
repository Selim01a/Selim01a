"""Deterministic TET4 mesher for axis-aligned boxes (CI / smoke / demo).

Supports optional local refinement near selected faces so users can
compare strategy behaviour without a full CAD topology stack.
"""

from __future__ import annotations

import hashlib
import math

from engcore.domain.analysis import GeometryRegion, MeshStrategy
from engcore.domain.models import GeometryModel, MeshModel, Tet4, Tri3, Vec3


class SyntheticMesher:
    def mesh_tet4(
        self,
        geometry: GeometryModel,
        max_size_m: float = 0.05,
        *,
        strategy: MeshStrategy | None = None,
    ) -> MeshModel:
        if not geometry.is_closed_solid:
            raise ValueError("Cannot mesh: geometry is not a closed solid.")

        dx = geometry.bbox_max.x - geometry.bbox_min.x
        dy = geometry.bbox_max.y - geometry.bbox_min.y
        dz = geometry.bbox_max.z - geometry.bbox_min.z
        if min(dx, dy, dz) <= 0:
            raise ValueError("Invalid bounding box for meshing.")

        global_size = strategy.global_size_m if strategy else max_size_m
        nx, ny, nz = _axis_counts(dx, dy, dz, global_size)

        if strategy and strategy.local_size_m and strategy.refine_region_ids:
            lx, ly, lz = _axis_counts(dx, dy, dz, strategy.local_size_m)
            nx, ny, nz = max(nx, lx), max(ny, ly), max(nz, lz)

        # Soft caps keep demos responsive while still differentiating strategies
        nx, ny, nz = min(nx, 24), min(ny, 24), min(nz, 16)

        nodes: list[Vec3] = []
        index: dict[tuple[int, int, int], int] = {}

        def node_at(i: int, j: int, k: int) -> int:
            key = (i, j, k)
            if key not in index:
                index[key] = len(nodes)
                u, v, w = i / nx, j / ny, k / nz
                if strategy and strategy.refine_region_ids:
                    u, v, w = _bias_uvw(u, v, w, strategy.refine_region_ids)
                nodes.append(
                    Vec3(
                        geometry.bbox_min.x + dx * u,
                        geometry.bbox_min.y + dy * v,
                        geometry.bbox_min.z + dz * w,
                    )
                )
            return index[key]

        cells: list[Tet4] = []
        for i in range(nx):
            for j in range(ny):
                for k in range(nz):
                    c000 = node_at(i, j, k)
                    c100 = node_at(i + 1, j, k)
                    c010 = node_at(i, j + 1, k)
                    c110 = node_at(i + 1, j + 1, k)
                    c001 = node_at(i, j, k + 1)
                    c101 = node_at(i + 1, j, k + 1)
                    c011 = node_at(i, j + 1, k + 1)
                    c111 = node_at(i + 1, j + 1, k + 1)
                    cells.extend(
                        [
                            Tet4(c000, c100, c110, c111),
                            Tet4(c000, c010, c110, c111),
                            Tet4(c000, c010, c011, c111),
                            Tet4(c000, c001, c011, c111),
                            Tet4(c000, c001, c101, c111),
                            Tet4(c000, c100, c101, c111),
                        ]
                    )

        sid = strategy.strategy_id if strategy else "default"
        digest = hashlib.sha256(
            f"{geometry.solid_id}:{geometry.source_sha256}:{nx}x{ny}x{nz}:{sid}".encode()
        ).hexdigest()[:12]
        return MeshModel(
            mesh_id=f"mesh-{digest}",
            nodes=tuple(nodes),
            cells=tuple(cells),
            geometry_ref=geometry.solid_id,
            backend="synthetic",
            element_type="TET4",
            strategy_id=sid,
            target_region_ids=strategy.refine_region_ids if strategy else (),
            size_m=global_size,
        )

    def mesh_surface_tri3(
        self,
        geometry: GeometryModel,
        *,
        face_region_ids: tuple[str, ...],
        size_m: float,
        regions: tuple[GeometryRegion, ...] = (),
    ) -> MeshModel:
        """Triangulate selected face AABBs (fixture / bbox faces)."""
        if not face_region_ids:
            raise ValueError("Select at least one surface to mesh.")
        by_id = {r.region_id: r for r in regions}
        nodes: list[Vec3] = []
        cells: list[Tri3] = []
        size = max(size_m, 1e-9)

        for rid in face_region_ids:
            r = by_id.get(rid)
            if r is None or not r.bbox_min or not r.bbox_max:
                # Fall back to whole solid bbox face mapping for named faces
                patch = _bbox_face_patch(geometry, rid)
            else:
                patch = (r.bbox_min, r.bbox_max)
            if patch is None:
                continue
            bmin, bmax = patch
            cells.extend(_grid_tri_face(nodes, bmin, bmax, size))

        if not cells:
            raise ValueError("No meshed faces — check selection / region bboxes.")

        digest = hashlib.sha256(
            f"surf:{geometry.solid_id}:{','.join(face_region_ids)}:{size_m}".encode()
        ).hexdigest()[:12]
        return MeshModel(
            mesh_id=f"surf-{digest}",
            nodes=tuple(nodes),
            cells=tuple(cells),
            geometry_ref=geometry.solid_id,
            backend="synthetic",
            element_type="TRI3",
            strategy_id="surface-selected-faces",
            target_region_ids=face_region_ids,
            size_m=size_m,
        )


def _bbox_face_patch(
    geometry: GeometryModel, rid: str
) -> tuple[tuple[float, float, float], tuple[float, float, float]] | None:
    mn = geometry.bbox_min
    mx = geometry.bbox_max
    eps = 1e-9
    table = {
        "face-xmin": ((mn.x, mn.y, mn.z), (mn.x + eps, mx.y, mx.z)),
        "face-xmax": ((mx.x - eps, mn.y, mn.z), (mx.x, mx.y, mx.z)),
        "face-ymin": ((mn.x, mn.y, mn.z), (mx.x, mn.y + eps, mx.z)),
        "face-ymax": ((mn.x, mx.y - eps, mn.z), (mx.x, mx.y, mx.z)),
        "face-zmin": ((mn.x, mn.y, mn.z), (mx.x, mx.y, mn.z + eps)),
        "face-zmax": ((mn.x, mn.y, mx.z - eps), (mx.x, mx.y, mx.z)),
        "side-xpos": ((mx.x - eps, mn.y, mn.z), (mx.x, mx.y, mx.z)),
        "top": ((mn.x, mn.y, mx.z - eps), (mx.x, mx.y, mx.z)),
        "bottom": ((mn.x, mn.y, mn.z), (mx.x, mx.y, mn.z + eps)),
        "hole-wall": (
            (mn.x + 0.3 * (mx.x - mn.x), mn.y + 0.3 * (mx.y - mn.y), mn.z),
            (mn.x + 0.7 * (mx.x - mn.x), mn.y + 0.7 * (mx.y - mn.y), mx.z),
        ),
    }
    return table.get(rid)


def _grid_tri_face(
    nodes: list[Vec3],
    bmin: tuple[float, float, float],
    bmax: tuple[float, float, float],
    size: float,
) -> list[Tri3]:
    sx = abs(bmax[0] - bmin[0])
    sy = abs(bmax[1] - bmin[1])
    sz = abs(bmax[2] - bmin[2])
    dims = sorted([(sx, 0), (sy, 1), (sz, 2)])
    # Thinnest axis is normal; other two span the face
    ax_u = dims[1][1]
    ax_v = dims[2][1]
    ax_n = dims[0][1]
    lu = max(dims[1][0], size)
    lv = max(dims[2][0], size)
    nu = max(1, int(math.ceil(lu / size)))
    nv = max(1, int(math.ceil(lv / size)))
    nu, nv = min(nu, 32), min(nv, 32)

    def corner(i: int, j: int) -> Vec3:
        t = [0.0, 0.0, 0.0]
        t[ax_u] = bmin[ax_u] + (bmax[ax_u] - bmin[ax_u]) * (i / nu)
        t[ax_v] = bmin[ax_v] + (bmax[ax_v] - bmin[ax_v]) * (j / nv)
        t[ax_n] = 0.5 * (bmin[ax_n] + bmax[ax_n])
        return Vec3(t[0], t[1], t[2])

    grid: dict[tuple[int, int], int] = {}
    for i in range(nu + 1):
        for j in range(nv + 1):
            grid[(i, j)] = len(nodes)
            nodes.append(corner(i, j))

    tris: list[Tri3] = []
    for i in range(nu):
        for j in range(nv):
            a = grid[(i, j)]
            b = grid[(i + 1, j)]
            c = grid[(i + 1, j + 1)]
            d = grid[(i, j + 1)]
            tris.append(Tri3(a, b, c))
            tris.append(Tri3(a, c, d))
    return tris


def _axis_counts(dx: float, dy: float, dz: float, size: float) -> tuple[int, int, int]:
    size = max(size, 1e-9)
    return (
        max(1, int(math.ceil(dx / size))),
        max(1, int(math.ceil(dy / size))),
        max(1, int(math.ceil(dz / size))),
    )


def _bias_uvw(u: float, v: float, w: float, regions: tuple[str, ...]) -> tuple[float, float, float]:
    """Pull parametric coords toward selected faces (smoothstep bias)."""

    def pull(t: float, toward_zero: bool) -> float:
        if toward_zero:
            return t * t
        return 1.0 - (1.0 - t) * (1.0 - t)

    def pull_center(t: float) -> float:
        return 0.5 + 0.5 * (2.0 * t - 1.0) ** 3

    uu, vv, ww = u, v, w
    names = set(regions)
    if names & {"face-xmin"}:
        uu = pull(uu, True)
    if names & {"face-xmax", "side-xpos"}:
        uu = pull(uu, False)
    if names & {"face-ymin"}:
        vv = pull(vv, True)
    if names & {"face-ymax"}:
        vv = pull(vv, False)
    if names & {"face-zmin", "bottom"}:
        ww = pull(ww, True)
    if names & {"face-zmax", "top"}:
        ww = pull(ww, False)
    if "hole-wall" in names:
        uu, vv = pull_center(uu), pull_center(vv)
    if any(r.startswith("cad-face-") for r in names):
        uu, vv, ww = pull_center(uu), pull_center(vv), pull_center(ww)
    return uu, vv, ww
