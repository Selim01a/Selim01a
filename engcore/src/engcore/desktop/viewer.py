"""PyVista mesh/geometry viewer helpers (no vendor CAD types in domain)."""

from __future__ import annotations

from engcore.domain.analysis import GeometryRegion
from engcore.domain.models import GeometryModel, MeshModel, Tet4, Tri3
from engcore.geometry.surface_preview import TriSurface, preview_surface


def geometry_outline_polydata(geometry: GeometryModel):
    import pyvista as pv

    mn = geometry.bbox_min
    mx = geometry.bbox_max
    return pv.Box(bounds=(mn.x, mx.x, mn.y, mx.y, mn.z, mx.z))


def geometry_surface_polydata(geometry: GeometryModel):
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


def mesh_to_polydata_or_grid(mesh: MeshModel):
    """Return PyVista dataset for TET4 or TRI3."""
    import numpy as np
    import pyvista as pv

    points = np.array([n.as_tuple() for n in mesh.nodes], dtype=float)
    if mesh.element_type == "TRI3":
        faces: list[int] = []
        for c in mesh.cells:
            assert isinstance(c, Tri3)
            faces.extend([3, c.n0, c.n1, c.n2])
        return pv.PolyData(points, np.array(faces, dtype=np.int64))

    cells: list[int] = []
    for c in mesh.cells:
        assert isinstance(c, Tet4)
        cells.extend([4, c.n0, c.n1, c.n2, c.n3])
    cell_array = np.array(cells, dtype=np.int64)
    cell_types = np.full(len(mesh.cells), pv.CellType.TETRA, dtype=np.uint8)
    return pv.UnstructuredGrid(cell_array, cell_types, points)


# Back-compat alias
def mesh_to_unstructured(mesh: MeshModel):
    return mesh_to_polydata_or_grid(mesh)


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
