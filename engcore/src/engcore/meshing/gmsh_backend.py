"""Gmsh mesher with optional face-local sizing. Vendor types stay here."""

from __future__ import annotations

from engcore.domain.analysis import MeshStrategy
from engcore.domain.models import GeometryModel, MeshModel, Tet4, Vec3


class GmshMesher:
    def mesh_tet4(
        self,
        geometry: GeometryModel,
        max_size_m: float = 0.05,
        *,
        strategy: MeshStrategy | None = None,
    ) -> MeshModel:
        if not geometry.is_closed_solid:
            raise ValueError("Cannot mesh: geometry is not a closed solid.")

        import gmsh

        global_size = strategy.global_size_m if strategy else max_size_m
        local_size = strategy.local_size_m if strategy else None
        refine_ids = strategy.refine_region_ids if strategy else ()
        scale = geometry.unit_policy.scale_to_si
        # Gmsh works in source-file coordinates; sizes must be in source units
        size_src = global_size / scale
        local_src = (local_size / scale) if local_size else None

        gmsh.initialize()
        try:
            gmsh.option.setNumber("General.Terminal", 0)
            gmsh.model.add("engcore_mesh")
            gmsh.model.occ.importShapes(geometry.source_path)
            gmsh.model.occ.synchronize()
            gmsh.option.setNumber("Mesh.CharacteristicLengthMax", size_src)
            gmsh.option.setNumber("Mesh.CharacteristicLengthMin", size_src * 0.2)
            gmsh.option.setNumber("Mesh.ElementOrder", 1)

            if local_src and refine_ids:
                face_tags = []
                for rid in refine_ids:
                    if rid.startswith("cad-face-"):
                        try:
                            face_tags.append(int(rid.rsplit("-", 1)[-1]))
                        except ValueError:
                            continue
                if face_tags:
                    gmsh.model.mesh.setSize([(2, t) for t in face_tags], local_src)

            gmsh.model.mesh.generate(3)

            node_tags, coords, _ = gmsh.model.mesh.getNodes()
            nodes = [
                Vec3(coords[i] * scale, coords[i + 1] * scale, coords[i + 2] * scale)
                for i in range(0, len(coords), 3)
            ]
            tag_to_idx = {int(t): i for i, t in enumerate(node_tags)}

            etypes, _, enode_tags = gmsh.model.mesh.getElements(3)
            cells: list[Tet4] = []
            for etype, block in zip(etypes, enode_tags, strict=False):
                if int(etype) != 4:
                    continue
                for i in range(0, len(block), 4):
                    cells.append(
                        Tet4(
                            tag_to_idx[int(block[i])],
                            tag_to_idx[int(block[i + 1])],
                            tag_to_idx[int(block[i + 2])],
                            tag_to_idx[int(block[i + 3])],
                        )
                    )
            if not cells:
                raise ValueError("Gmsh produced no TET4 elements for this STEP.")

            sid = strategy.strategy_id if strategy else "gmsh-default"
            return MeshModel(
                mesh_id=f"gmsh-mesh-{geometry.solid_id}-{sid}",
                nodes=tuple(nodes),
                cells=tuple(cells),
                geometry_ref=geometry.solid_id,
                backend="gmsh",
                strategy_id=sid,
            )
        finally:
            gmsh.finalize()
