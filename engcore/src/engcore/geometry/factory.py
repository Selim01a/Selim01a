from __future__ import annotations

from pathlib import Path

from engcore.geometry.synthetic import SyntheticGeometryImporter


def gmsh_available() -> bool:
    try:
        import gmsh  # noqa: F401

        # Ensure shared lib loads
        import gmsh as g

        _ = g.__version__
        return True
    except Exception:
        return False


def looks_like_synthetic_marker(path: Path) -> bool:
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return False
    return "ENGCORE_SYNTHETIC_UNIT_CUBE" in text


def get_geometry_importer(prefer_gmsh: bool = False, path: Path | None = None):
    """Return a GeometryImporter. Prefer Gmsh for real STEP when available."""
    p = Path(path) if path else None
    use_gmsh = prefer_gmsh
    if p is not None and p.suffix.lower() in {".step", ".stp"}:
        if looks_like_synthetic_marker(p):
            use_gmsh = False
        elif gmsh_available():
            use_gmsh = True
    if use_gmsh and gmsh_available():
        try:
            from engcore.geometry.gmsh_occ import GmshOccGeometryImporter

            return GmshOccGeometryImporter()
        except Exception:
            pass
    return SyntheticGeometryImporter()
