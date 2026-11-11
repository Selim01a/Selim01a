"""Named geometric mesh quality metrics. Not solver validation."""

from __future__ import annotations

import math

from engcore.domain.models import MeshModel, MetricSet, MetricValue, Tet4, Tri3, Vec3


def _sub(a: Vec3, b: Vec3) -> Vec3:
    return Vec3(a.x - b.x, a.y - b.y, a.z - b.z)


def _cross(a: Vec3, b: Vec3) -> Vec3:
    return Vec3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x)


def _dot(a: Vec3, b: Vec3) -> float:
    return a.x * b.x + a.y * b.y + a.z * b.z


def _norm(a: Vec3) -> float:
    return math.sqrt(_dot(a, a))


def _tet_volume(n0: Vec3, n1: Vec3, n2: Vec3, n3: Vec3) -> float:
    return _dot(_sub(n1, n0), _cross(_sub(n2, n0), _sub(n3, n0))) / 6.0


def _edge_lengths(nodes: tuple[Vec3, ...], cell: Tet4) -> list[float]:
    pts = [nodes[cell.n0], nodes[cell.n1], nodes[cell.n2], nodes[cell.n3]]
    edges = [(0, 1), (0, 2), (0, 3), (1, 2), (1, 3), (2, 3)]
    return [_norm(_sub(pts[i], pts[j])) for i, j in edges]


class GeometricMetricComputer:
    def compute(self, mesh: MeshModel) -> MetricSet:
        if not mesh.cells:
            raise ValueError("Cannot compute metrics on empty mesh.")
        if mesh.element_type == "TRI3":
            return self._compute_tri3(mesh)
        if mesh.element_type != "TET4":
            raise ValueError(f"Unsupported element type: {mesh.element_type}")

        volumes: list[float] = []
        aspects: list[float] = []
        for cell in mesh.cells:
            assert isinstance(cell, Tet4)
            n0, n1, n2, n3 = (
                mesh.nodes[cell.n0],
                mesh.nodes[cell.n1],
                mesh.nodes[cell.n2],
                mesh.nodes[cell.n3],
            )
            vol = abs(_tet_volume(n0, n1, n2, n3))
            volumes.append(vol)
            lengths = _edge_lengths(mesh.nodes, cell)
            mn, mx = min(lengths), max(lengths)
            aspects.append(mx / mn if mn > 0 else float("inf"))

        min_vol = min(volumes)
        max_aspect = max(aspects)
        mean_vol = sum(volumes) / len(volumes)

        signed = []
        for cell in mesh.cells:
            assert isinstance(cell, Tet4)
            signed.append(
                _tet_volume(
                    mesh.nodes[cell.n0],
                    mesh.nodes[cell.n1],
                    mesh.nodes[cell.n2],
                    mesh.nodes[cell.n3],
                )
            )
        positive_frac = sum(1 for v in signed if v > 0) / len(signed)

        metrics = (
            MetricValue(
                "min_tet_volume",
                min_vol,
                "m^3",
                "Minimum absolute TET4 volume (geometric, not solver Jacobian).",
            ),
            MetricValue(
                "mean_tet_volume",
                mean_vol,
                "m^3",
                "Mean absolute TET4 volume.",
            ),
            MetricValue(
                "max_aspect_ratio",
                max_aspect,
                "1",
                "Max edge-length aspect ratio across TET4 elements.",
            ),
            MetricValue(
                "positive_volume_fraction",
                positive_frac,
                "1",
                "Fraction of tets with positive signed volume (orientation health).",
            ),
            MetricValue(
                "n_elements",
                float(len(mesh.cells)),
                "1",
                "Number of TET4 elements.",
            ),
            MetricValue(
                "n_nodes",
                float(len(mesh.nodes)),
                "1",
                "Number of mesh nodes.",
            ),
        )
        return MetricSet(mesh_ref=mesh.mesh_id, metrics=metrics)

    def _compute_tri3(self, mesh: MeshModel) -> MetricSet:
        areas: list[float] = []
        aspects: list[float] = []
        for cell in mesh.cells:
            assert isinstance(cell, Tri3)
            a, b, c = mesh.nodes[cell.n0], mesh.nodes[cell.n1], mesh.nodes[cell.n2]
            area = 0.5 * _norm(_cross(_sub(b, a), _sub(c, a)))
            areas.append(area)
            edges = [_norm(_sub(b, a)), _norm(_sub(c, b)), _norm(_sub(a, c))]
            mn, mx = min(edges), max(edges)
            aspects.append(mx / mn if mn > 0 else float("inf"))
        return MetricSet(
            mesh_ref=mesh.mesh_id,
            metrics=(
                MetricValue("min_tri_area", min(areas), "m^2", "Minimum TRI3 area."),
                MetricValue("mean_tri_area", sum(areas) / len(areas), "m^2", "Mean TRI3 area."),
                MetricValue(
                    "max_aspect_ratio",
                    max(aspects),
                    "1",
                    "Max edge-length aspect ratio across TRI3 elements.",
                ),
                MetricValue("n_elements", float(len(mesh.cells)), "1", "Number of TRI3 elements."),
                MetricValue("n_nodes", float(len(mesh.nodes)), "1", "Number of mesh nodes."),
            ),
        )
