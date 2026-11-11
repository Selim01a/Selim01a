"""Gmsh/OCC STEP importer. Vendor types never leave this module."""

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

        import gmsh

        raw = path.read_bytes()
        digest = hashlib.sha256(raw).hexdigest()
        solid_name = path.stem.replace(" ", "_")[:64] or "step-solid"

        gmsh.initialize()
        try:
            gmsh.option.setNumber("General.Terminal", 0)
            gmsh.model.add("engcore_import")
            gmsh.model.occ.importShapes(str(path))
            gmsh.model.occ.synchronize()
            volumes = gmsh.model.getEntities(3)
            if not volumes:
                # Some STEP files expose volumes only via OCC entities
                volumes = gmsh.model.occ.getEntities(3)
            if not volumes:
                raise ValueError(
                    f"No closed 3D solid volumes found in STEP:\n{path}\n"
                    "The file may be a surface/assembly without a solid body."
                )
            dim, tag = volumes[0]
            try:
                xmin, ymin, zmin, xmax, ymax, zmax = gmsh.model.getBoundingBox(dim, tag)
            except Exception:
                xmin, ymin, zmin, xmax, ymax, zmax = gmsh.model.occ.getBoundingBox(dim, tag)
            try:
                mass = float(gmsh.model.occ.getMass(dim, tag))
            except Exception:
                # Fallback volume estimate from bbox
                mass = abs((xmax - xmin) * (ymax - ymin) * (zmax - zmin))
            scale = unit_policy.scale_to_si
            return GeometryModel(
                solid_id=f"{solid_name}-{tag}",
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
