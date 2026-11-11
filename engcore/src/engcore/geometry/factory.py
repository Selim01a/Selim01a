from __future__ import annotations

from engcore.geometry.synthetic import SyntheticGeometryImporter


def get_geometry_importer(prefer_gmsh: bool = False) -> SyntheticGeometryImporter:
    """Return a GeometryImporter. Gmsh adapter is optional and local-only."""
    if prefer_gmsh:
        try:
            from engcore.geometry.gmsh_occ import GmshOccGeometryImporter

            return GmshOccGeometryImporter()  # type: ignore[return-value]
        except Exception:
            pass
    return SyntheticGeometryImporter()
