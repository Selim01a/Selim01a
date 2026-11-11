from __future__ import annotations

from engcore.meshing.synthetic import SyntheticMesher


def get_mesher(prefer_gmsh: bool = False) -> SyntheticMesher:
    if prefer_gmsh:
        try:
            from engcore.meshing.gmsh_backend import GmshMesher

            return GmshMesher()  # type: ignore[return-value]
        except Exception:
            pass
    return SyntheticMesher()
