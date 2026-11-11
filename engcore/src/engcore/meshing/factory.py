from __future__ import annotations

from engcore.domain.models import GeometryModel
from engcore.geometry.factory import gmsh_available
from engcore.meshing.synthetic import SyntheticMesher


def get_mesher(prefer_gmsh: bool = False, geometry: GeometryModel | None = None):
    """Use Gmsh mesher for Gmsh-backed geometry (real STEP); else synthetic."""
    want = prefer_gmsh or (geometry is not None and geometry.backend == "gmsh")
    if want and gmsh_available():
        try:
            from engcore.meshing.gmsh_backend import GmshMesher

            return GmshMesher()
        except Exception:
            pass
    return SyntheticMesher()
