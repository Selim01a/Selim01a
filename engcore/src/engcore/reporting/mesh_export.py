"""Export meshed geometry for downstream use (JSON / VTK / STL surface)."""

from __future__ import annotations

import json
from pathlib import Path

from engcore.domain.models import MeshModel, PipelineRun


def export_meshed_geometry(run: PipelineRun, out_dir: Path) -> dict[str, str]:
    """Write mesh artifacts; returns map of format → path."""
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    paths: dict[str, str] = {}

    mesh = run.mesh
    json_path = out_dir / "mesh.json"
    json_path.write_text(
        json.dumps(
            {
                "schema": "engcore.mesh.v1",
                "mesh_id": mesh.mesh_id,
                "geometry_ref": mesh.geometry_ref,
                "element_type": mesh.element_type,
                "backend": mesh.backend,
                "strategy_id": mesh.strategy_id,
                "units": "m",
                "n_nodes": mesh.n_nodes,
                "n_cells": mesh.n_cells,
                "nodes": [n.as_tuple() for n in mesh.nodes],
                "cells": [c.as_tuple() for c in mesh.cells],
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    paths["json"] = str(json_path.resolve())

    try:
        import numpy as np
        import pyvista as pv

        points = np.array([n.as_tuple() for n in mesh.nodes], dtype=float)
        cells: list[int] = []
        for c in mesh.cells:
            cells.extend([4, c.n0, c.n1, c.n2, c.n3])
        grid = pv.UnstructuredGrid(
            np.array(cells, dtype=np.int64),
            np.full(len(mesh.cells), pv.CellType.TETRA, dtype=np.uint8),
            points,
        )
        vtk_path = out_dir / "mesh.vtu"
        grid.save(str(vtk_path))
        paths["vtu"] = str(vtk_path.resolve())
        try:
            try:
                surf = grid.extract_surface(algorithm="dataset_surface")
            except TypeError:
                surf = grid.extract_surface()
            stl_path = out_dir / "mesh_surface.stl"
            surf.save(str(stl_path))
            paths["stl"] = str(stl_path.resolve())
        except Exception:
            pass
    except Exception:
        vtk_path = out_dir / "mesh.vtk"
        _write_legacy_vtk(mesh, vtk_path)
        paths["vtk"] = str(vtk_path.resolve())

    meta = out_dir / "export_manifest.json"
    meta.write_text(
        json.dumps(
            {
                "run_id": run.run_id,
                "solid_id": run.geometry.solid_id,
                "strategy_id": mesh.strategy_id,
                "overall_status": run.overall_status(),
                "artifacts": paths,
                "disclaimer": (
                    "Meshed geometry export is geometric only — not solver-validated."
                ),
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    paths["manifest"] = str(meta.resolve())
    return paths


def _write_legacy_vtk(mesh: MeshModel, path: Path) -> None:
    lines = [
        "# vtk DataFile Version 3.0",
        f"engcore {mesh.mesh_id}",
        "ASCII",
        "DATASET UNSTRUCTURED_GRID",
        f"POINTS {mesh.n_nodes} float",
    ]
    for n in mesh.nodes:
        lines.append(f"{n.x} {n.y} {n.z}")
    cell_size = mesh.n_cells * 5
    lines.append(f"CELLS {mesh.n_cells} {cell_size}")
    for c in mesh.cells:
        lines.append(f"4 {c.n0} {c.n1} {c.n2} {c.n3}")
    lines.append(f"CELL_TYPES {mesh.n_cells}")
    lines.extend(["10"] * mesh.n_cells)
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
