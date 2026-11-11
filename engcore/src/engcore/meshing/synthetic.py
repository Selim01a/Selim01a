"""Deterministic TET4 mesher for axis-aligned boxes (CI / smoke)."""

from __future__ import annotations

import hashlib

from engcore.domain.models import GeometryModel, MeshModel, Tet4, Vec3


class SyntheticMesher:
    def mesh_tet4(self, geometry: GeometryModel, max_size_m: float = 0.05) -> MeshModel:
        if not geometry.is_closed_solid:
            raise ValueError("Cannot mesh: geometry is not a closed solid.")

        # Subdivide bbox into an n×n×n grid of cubes, each split into 6 TET4.
        dx = geometry.bbox_max.x - geometry.bbox_min.x
        dy = geometry.bbox_max.y - geometry.bbox_min.y
        dz = geometry.bbox_max.z - geometry.bbox_min.z
        if min(dx, dy, dz) <= 0:
            raise ValueError("Invalid bounding box for meshing.")

        n = max(1, int(max(dx, dy, dz) / max(max_size_m, 1e-9)))
        n = min(n, 8)  # keep smoke meshes small

        nodes: list[Vec3] = []
        index: dict[tuple[int, int, int], int] = {}

        def node_at(i: int, j: int, k: int) -> int:
            key = (i, j, k)
            if key not in index:
                index[key] = len(nodes)
                nodes.append(
                    Vec3(
                        geometry.bbox_min.x + dx * i / n,
                        geometry.bbox_min.y + dy * j / n,
                        geometry.bbox_min.z + dz * k / n,
                    )
                )
            return index[key]

        cells: list[Tet4] = []
        for i in range(n):
            for j in range(n):
                for k in range(n):
                    c000 = node_at(i, j, k)
                    c100 = node_at(i + 1, j, k)
                    c010 = node_at(i, j + 1, k)
                    c110 = node_at(i + 1, j + 1, k)
                    c001 = node_at(i, j, k + 1)
                    c101 = node_at(i + 1, j, k + 1)
                    c011 = node_at(i, j + 1, k + 1)
                    c111 = node_at(i + 1, j + 1, k + 1)
                    # Six-tet cube split along space diagonal 000→111 (non-overlapping, positive vol)
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

        digest = hashlib.sha256(
            f"{geometry.solid_id}:{geometry.source_sha256}:{n}".encode()
        ).hexdigest()[:12]
        return MeshModel(
            mesh_id=f"mesh-{digest}",
            nodes=tuple(nodes),
            cells=tuple(cells),
            geometry_ref=geometry.solid_id,
            backend="synthetic",
        )
