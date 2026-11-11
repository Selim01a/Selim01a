"""Gmsh mesher with optional face-local sizing. Vendor types stay here."""

from __future__ import annotations

from engcore.domain.analysis import MeshStrategy
from engcore.domain.models import GeometryModel, MeshModel, Tet4, Tri3, Vec3


def _face_tags_from_regions(region_ids: tuple[str, ...]) -> list[int]:
    tags: list[int] = []
    for rid in region_ids:
        if rid.startswith("cad-face-"):
            try:
                tags.append(int(rid.rsplit("-", 1)[-1]))
            except ValueError:
                continue
    return tags


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

            face_tags = _face_tags_from_regions(refine_ids)
            if local_src and face_tags:
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
                element_type="TET4",
                strategy_id=sid,
                target_region_ids=refine_ids,
                size_m=global_size,
            )
        finally:
            gmsh.finalize()

    def mesh_surface_tri3(
        self,
        geometry: GeometryModel,
        *,
        face_region_ids: tuple[str, ...],
        size_m: float,
    ) -> MeshModel:
        """Mesh only the selected CAD faces as TRI3 (no volume fill)."""
        if not face_region_ids:
            raise ValueError("Select at least one surface to mesh.")
        face_tags = _face_tags_from_regions(face_region_ids)
        if not face_tags:
            raise ValueError(
                "Surface mesh requires CAD faces (cad-face-*). "
                "Open a real STEP with Gmsh, or use volume mesh on fixture faces."
            )

        import gmsh

        scale = geometry.unit_policy.scale_to_si
        size_src = size_m / scale

        gmsh.initialize()
        try:
            gmsh.option.setNumber("General.Terminal", 0)
            gmsh.model.add("engcore_surf")
            gmsh.model.occ.importShapes(geometry.source_path)
            gmsh.model.occ.synchronize()
            gmsh.option.setNumber("Mesh.CharacteristicLengthMax", size_src)
            gmsh.option.setNumber("Mesh.CharacteristicLengthMin", size_src * 0.25)
            gmsh.option.setNumber("Mesh.ElementOrder", 1)
            # Size only the selected faces; leave others coarse / unmeshed preference
            gmsh.model.mesh.setSize([(2, t) for t in face_tags], size_src)
            # Mesh 2D globally then keep triangles that belong to selected faces
            gmsh.model.mesh.generate(2)

            nodes_out: list[Vec3] = []
            cells: list[Tri3] = []
            global_map: dict[int, int] = {}

            def map_node(tag: int) -> int:
                if tag in global_map:
                    return global_map[tag]
                coord = gmsh.model.mesh.getNode(tag)[0]
                idx = len(nodes_out)
                nodes_out.append(
                    Vec3(coord[0] * scale, coord[1] * scale, coord[2] * scale)
                )
                global_map[tag] = idx
                return idx

            for tag in face_tags:
                etypes, _, enodes = gmsh.model.mesh.getElements(2, tag)
                for etype, block in zip(etypes, enodes, strict=False):
                    if int(etype) != 2:
                        continue
                    for i in range(0, len(block), 3):
                        cells.append(
                            Tri3(
                                map_node(int(block[i])),
                                map_node(int(block[i + 1])),
                                map_node(int(block[i + 2])),
                            )
                        )
            if not cells:
                raise ValueError("Gmsh produced no TRI3 elements on selected faces.")

            return MeshModel(
                mesh_id=f"gmsh-surf-{geometry.solid_id}-{'-'.join(map(str, face_tags))}",
                nodes=tuple(nodes_out),
                cells=tuple(cells),
                geometry_ref=geometry.solid_id,
                backend="gmsh",
                element_type="TRI3",
                strategy_id="surface-selected-faces",
                target_region_ids=face_region_ids,
                size_m=size_m,
            )
        finally:
            gmsh.finalize()
