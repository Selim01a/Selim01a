"""PyVista mesh/geometry viewer helpers (no vendor CAD types in domain)."""

from __future__ import annotations

from engcore.domain.analysis import GeometryRegion
from engcore.domain.models import GeometryModel, MeshModel
from engcore.geometry.surface_preview import TriSurface, preview_surface


def geometry_outline_polydata(geometry: GeometryModel):
    import pyvista as pv

    mn = geometry.bbox_min
    mx = geometry.bbox_max
    return pv.Box(bounds=(mn.x, mx.x, mn.y, mx.y, mn.z, mx.z))


def geometry_surface_polydata(geometry: GeometryModel):
    import numpy as np
    import pyvista as pv

    surf = preview_surface(geometry)
    return trisurface_to_polydata(surf)


def trisurface_to_polydata(surf: TriSurface):
    import numpy as np
    import pyvista as pv

    points = np.array([n.as_tuple() for n in surf.nodes], dtype=float)
    faces = []
    for a, b, c in surf.triangles:
        faces.extend([3, a, b, c])
    return pv.PolyData(points, np.array(faces, dtype=np.int64))


def mesh_to_unstructured(mesh: MeshModel):
    import numpy as np
    import pyvista as pv

    points = np.array([n.as_tuple() for n in mesh.nodes], dtype=float)
    cells = []
    for c in mesh.cells:
        cells.extend([4, c.n0, c.n1, c.n2, c.n3])
    cell_array = np.array(cells, dtype=np.int64)
    cell_types = np.full(len(mesh.cells), pv.CellType.TETRA, dtype=np.uint8)
    return pv.UnstructuredGrid(cell_array, cell_types, points)


def region_box_polydata(region: GeometryRegion):
    import pyvista as pv

    if not region.bbox_min or not region.bbox_max:
        return None
    b = (
        region.bbox_min[0],
        region.bbox_max[0],
        region.bbox_min[1],
        region.bbox_max[1],
        region.bbox_min[2],
        region.bbox_max[2],
    )
    return pv.Box(bounds=b)
