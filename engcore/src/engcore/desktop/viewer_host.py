"""Mandatory 3D viewer host — backbone of the desktop workstation."""

from __future__ import annotations

from engcore.domain.analysis import GeometryRegion
from engcore.domain.models import GeometryModel, MeshModel
from engcore.desktop.viewer import (
    geometry_outline_polydata,
    geometry_surface_polydata,
    mesh_to_unstructured,
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
    """Return a QWidget hosting the PyVistaQt interactor.

    Implemented as a factory so PySide6 is only imported when the desktop
    stack is actually launched (keeps headless imports light).
    """
    from PySide6.QtWidgets import QLabel, QVBoxLayout, QWidget
    from pyvistaqt import QtInteractor

    class _ViewerHost(QWidget):
        def __init__(self, parent=None) -> None:
            super().__init__(parent)
            layout = QVBoxLayout(self)
            layout.setContentsMargins(0, 0, 0, 0)
            self._caption = QLabel(
                "3D workspace — orbit: left-drag · zoom: scroll · pan: middle/shift-drag"
            )
            layout.addWidget(self._caption)
            self.plotter = QtInteractor(self)
            layout.addWidget(self.plotter.interactor, stretch=1)
            self.plotter.add_axes()
            self._smoke_ok = False

        def smoke_render(self) -> None:
            """Fail fast if OpenGL/Qt interactor cannot render."""
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
            mesh: MeshModel | None = None,
            regions: list[GeometryRegion] | None = None,
            selected_region_ids: tuple[str, ...] = (),
        ) -> None:
            self.plotter.clear()
            self.plotter.add_axes()
            if geometry is None:
                self.plotter.render()
                return
            try:
                surf = geometry_surface_polydata(geometry)
                self.plotter.add_mesh(surf, color="silver", opacity=0.35, show_edges=True)
            except Exception:
                outline = geometry_outline_polydata(geometry)
                self.plotter.add_mesh(
                    outline, style="wireframe", color="black", line_width=2
                )
            if mesh is not None:
                grid = mesh_to_unstructured(mesh)
                self.plotter.add_mesh(
                    grid, show_edges=True, opacity=0.5, color="lightblue"
                )
            if regions:
                selected = set(selected_region_ids)
                for r in regions:
                    if r.region_id not in selected:
                        continue
                    box = region_box_polydata(r)
                    if box is not None:
                        self.plotter.add_mesh(box, color="orange", opacity=0.3)
            self.plotter.reset_camera()
            self.plotter.render()

    return _ViewerHost(parent)
