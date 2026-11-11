"""Optional Gmsh mesher. Vendor types never leave this module."""

from __future__ import annotations

from engcore.domain.models import GeometryModel, MeshModel, Tet4, Vec3


class GmshMesher:
    def mesh_tet4(self, geometry: GeometryModel, max_size_m: float = 0.05) -> MeshModel:
        if not geometry.is_closed_solid:
            raise ValueError("Cannot mesh: geometry is not a closed solid.")

        import gmsh

        gmsh.initialize()
        try:
            gmsh.option.setNumber("General.Terminal", 0)
            gmsh.model.add("engcore_mesh")
            gmsh.model.occ.importShapes(geometry.source_path)
            gmsh.model.occ.synchronize()
            gmsh.option.setNumber("Mesh.CharacteristicLengthMax", max_size_m)
            gmsh.option.setNumber("Mesh.ElementOrder", 1)
            gmsh.model.mesh.generate(3)

            node_tags, coords, _ = gmsh.model.mesh.getNodes()
            nodes = [
                Vec3(coords[i], coords[i + 1], coords[i + 2])
                for i in range(0, len(coords), 3)
            ]
            tag_to_idx = {int(t): i for i, t in enumerate(node_tags)}

            # Element type 4 = 4-node tetrahedron in Gmsh
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
                raise ValueError("Gmsh produced no TET4 elements.")

            return MeshModel(
                mesh_id=f"gmsh-mesh-{geometry.solid_id}",
                nodes=tuple(nodes),
                cells=tuple(cells),
                geometry_ref=geometry.solid_id,
                backend="gmsh",
            )
        finally:
            gmsh.finalize()
