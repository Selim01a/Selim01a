"""Deterministic TET4 mesher for axis-aligned boxes (CI / smoke / demo).

Supports optional local refinement near selected faces so users can
compare strategy behaviour without a full CAD topology stack.
"""

from __future__ import annotations

import hashlib
import math

from engcore.domain.analysis import MeshStrategy
from engcore.domain.models import GeometryModel, MeshModel, Tet4, Vec3


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
            strategy_id=sid,
        )


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
