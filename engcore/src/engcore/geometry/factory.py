from __future__ import annotations

from pathlib import Path

from engcore.geometry.synthetic import SyntheticGeometryImporter


GMSH_INSTALL_HINT = (
    "Real STEP/STP files require the Gmsh/OpenCASCADE backend.\n\n"
    "Install:\n"
    "  python -m pip install gmsh\n"
    "or:\n"
    '  python -m pip install -e ".[desktop]"\n\n'
    "Then restart ENGINEERING//CORE and open your STEP again."
)


def gmsh_available() -> bool:
    try:
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


class MissingGmshError(RuntimeError):
    """Raised when a real STEP is opened without Gmsh installed."""


def get_geometry_importer(prefer_gmsh: bool = False, path: Path | None = None):
    """Return importer. Real STEP always needs Gmsh; fixtures may use synthetic."""
    p = Path(path) if path else None
    suffix = p.suffix.lower() if p else ""

    if suffix in {".step", ".stp"}:
        if looks_like_synthetic_marker(p):
            return SyntheticGeometryImporter()
        if gmsh_available():
            from engcore.geometry.gmsh_occ import GmshOccGeometryImporter

            return GmshOccGeometryImporter()
        raise MissingGmshError(GMSH_INSTALL_HINT)

    if suffix in {".json", ".fixture.json"}:
        return SyntheticGeometryImporter()

    # Unknown / no path: prefer gmsh if requested and available
    if prefer_gmsh and gmsh_available():
        from engcore.geometry.gmsh_occ import GmshOccGeometryImporter

        return GmshOccGeometryImporter()
    return SyntheticGeometryImporter()
