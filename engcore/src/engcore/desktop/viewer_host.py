"""Mandatory 3D viewer host — backbone of the desktop workstation."""

from __future__ import annotations

from engcore.domain.analysis import GeometryRegion
from engcore.domain.models import GeometryModel, MeshModel
from engcore.desktop.viewer import (
    geometry_outline_polydata,
    geometry_surface_polydata,
    mesh_to_polydata_or_grid,
    region_box_polydata,
)


GL_ERROR_HELP = (
    "3D OpenGL context could not be created.\n\n"
    "ENGINEERING//CORE requires a working 3D viewer.\n\n"
    "Try:\n"
    "• Update your GPU drivers\n"
    "• Run on a local desktop session (not a broken remote/OpenGL-less session)\n"
    "• Ensure QT_OPENGL=desktop (the launcher sets this on Windows)\n"
    "• Do not set QT_QPA_PLATFORM=offscreen on Windows\n"
)


def ViewerHost(parent=None):
    """Return a QWidget hosting the PyVistaQt interactor."""
    from PySide6.QtWidgets import QLabel, QVBoxLayout, QWidget
    from pyvistaqt import QtInteractor

    class _ViewerHost(QWidget):
        def __init__(self, parent=None) -> None:
            super().__init__(parent)
            layout = QVBoxLayout(self)
            layout.setContentsMargins(0, 0, 0, 0)
            self._caption = QLabel(
                "3D — orbit: left-drag · zoom: scroll · pan: middle/shift-drag  |  "
                "Import shows CAD geometry only; mesh appears after you apply it."
            )
            layout.addWidget(self._caption)
            self.plotter = QtInteractor(self)
            layout.addWidget(self.plotter.interactor, stretch=1)
            self.plotter.add_axes()
            self._smoke_ok = False

        def smoke_render(self) -> None:
            try:
                self.plotter.clear()
                self.plotter.add_axes()
                self.plotter.render()
                self._smoke_ok = True
            except Exception as exc:
                self._smoke_ok = False
                raise RuntimeError(f"{GL_ERROR_HELP}\nTechnical detail: {exc}") from exc

        @property
        def ready(self) -> bool:
            return self._smoke_ok

        def show_scene(
            self,
            geometry: GeometryModel | None,
            meshes: list[MeshModel] | None = None,
            *,
            mesh: MeshModel | None = None,  # back-compat single mesh
            regions: list[GeometryRegion] | None = None,
            selected_region_ids: tuple[str, ...] = (),
            show_geometry: bool = True,
            hidden_region_ids: set[str] | None = None,
            hidden_mesh_ids: set[str] | None = None,
        ) -> None:
            hidden_regions = hidden_region_ids or set()
            hidden_meshes = hidden_mesh_ids or set()
            mesh_list = list(meshes or [])
            if mesh is not None:
                mesh_list.append(mesh)

            self.plotter.clear()
            self.plotter.add_axes()
            if geometry is None:
                self.plotter.render()
                return

            # CAD look: solid shading, NO analysis-mesh edges on the body
            if show_geometry:
                try:
                    surf = geometry_surface_polydata(geometry)
                    self.plotter.add_mesh(
                        surf,
                        color="#C0C4C8",
                        opacity=0.85,
                        show_edges=False,
                        smooth_shading=True,
                    )
                except Exception:
                    outline = geometry_outline_polydata(geometry)
                    self.plotter.add_mesh(
                        outline, style="wireframe", color="black", line_width=2
                    )

            # Selected faces highlight (skip hidden)
            if regions:
                selected = set(selected_region_ids) - hidden_regions
                for r in regions:
                    if r.region_id not in selected:
                        continue
                    box = region_box_polydata(r)
                    if box is not None:
                        self.plotter.add_mesh(
                            box, color="#E67E22", opacity=0.35, show_edges=False
                        )

            # Analysis meshes only when present and visible
            for m in mesh_list:
                if m.mesh_id in hidden_meshes:
                    continue
                grid = mesh_to_polydata_or_grid(m)
                color = "#5DADE2" if m.element_type == "TRI3" else "#85C1E9"
                self.plotter.add_mesh(
                    grid, show_edges=True, opacity=0.55, color=color
                )

            self.plotter.reset_camera()
            self.plotter.render()

    return _ViewerHost(parent)
