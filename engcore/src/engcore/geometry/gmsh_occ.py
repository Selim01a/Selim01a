"""Optional Gmsh/OCC importer. Vendor types never leave this module."""

from __future__ import annotations

import hashlib
from pathlib import Path

from engcore.domain.models import GeometryModel, UnitPolicy, Vec3


class GmshOccGeometryImporter:
    def import_step(self, path: Path, unit_policy: UnitPolicy) -> GeometryModel:
        unit_policy.require_confirmed()
        path = Path(path)
        if not path.exists():
            raise FileNotFoundError(path)

        import gmsh  # local optional dependency

        raw = path.read_bytes()
        digest = hashlib.sha256(raw).hexdigest()

        gmsh.initialize()
        try:
            gmsh.option.setNumber("General.Terminal", 0)
            gmsh.model.add("engcore_import")
            gmsh.model.occ.importShapes(str(path))
            gmsh.model.occ.synchronize()
            volumes = gmsh.model.occ.getEntities(3)
            if not volumes:
                raise ValueError("No closed 3D solid volumes found in STEP.")
            # Use first volume; OCC tags are NOT durable ids.
            dim, tag = volumes[0]
            xmin, ymin, zmin, xmax, ymax, zmax = gmsh.model.occ.getBoundingBox(dim, tag)
            mass = gmsh.model.occ.getMass(dim, tag)
            scale = unit_policy.scale_to_si
            return GeometryModel(
                solid_id=f"gmsh-solid-{tag}",  # logical run id only; not persistent CAD id
                bbox_min=Vec3(xmin * scale, ymin * scale, zmin * scale),
                bbox_max=Vec3(xmax * scale, ymax * scale, zmax * scale),
                volume_m3=float(mass) * (scale**3),
                is_closed_solid=True,
                unit_policy=unit_policy,
                source_sha256=digest,
                source_path=str(path.resolve()),
                backend="gmsh",
            )
        finally:
            gmsh.finalize()
