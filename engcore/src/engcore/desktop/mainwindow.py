"""PySide6 main window: STEP/mesh view + analysis context + strategy compare."""

from __future__ import annotations

from dataclasses import replace
from datetime import datetime
from pathlib import Path

from engcore.domain.analysis import AnalysisContext
from engcore.orchestration.pipeline import (
    compare_strategies,
    import_geometry,
    propose_strategies,
    run_with_strategy,
)
from engcore.paths import default_output_dir, fixture_dir
from engcore.standards.mesh_advisor import MeshStrategyAdvisor


def run_desktop() -> int:
    from PySide6.QtCore import Qt
    from PySide6.QtWidgets import (
        QApplication,
        QCheckBox,
        QComboBox,
        QFileDialog,
        QFormLayout,
        QGroupBox,
        QHBoxLayout,
        QLabel,
        QListWidget,
        QListWidgetItem,
        QMainWindow,
        QMessageBox,
        QPushButton,
        QSplitter,
        QTableWidget,
        QTableWidgetItem,
        QTextEdit,
        QVBoxLayout,
        QWidget,
    )

    # Prefer offscreen-friendly defaults when no display
    import os

    if not os.environ.get("DISPLAY") and not os.environ.get("WAYLAND_DISPLAY"):
        os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")

    from pyvistaqt import QtInteractor

    from engcore.desktop.viewer import (
        geometry_outline_polydata,
        mesh_to_unstructured,
        region_box_polydata,
    )

    class MainWindow(QMainWindow):
        def __init__(self) -> None:
            super().__init__()
            self.setWindowTitle("ENGINEERING//CORE M1 — Mesh decision workstation")
            self.resize(1280, 800)

            self._geometry = None
            self._proposal = None
            self._regions = []
            self._last_mesh = None
            self._input_path = fixture_dir() / "unit_cube.step"

            root = QWidget()
            self.setCentralWidget(root)
            layout = QHBoxLayout(root)
            splitter = QSplitter()
            layout.addWidget(splitter)

            # --- Left controls ---
            left = QWidget()
            left_l = QVBoxLayout(left)

            file_row = QHBoxLayout()
            self.path_label = QLabel(str(self._input_path))
            self.path_label.setWordWrap(True)
            btn_browse = QPushButton("Browse STEP…")
            btn_browse.clicked.connect(self._browse)
            btn_fixture = QPushButton("Demo fixture")
            btn_fixture.clicked.connect(self._load_fixture)
            file_row.addWidget(btn_browse)
            file_row.addWidget(btn_fixture)
            left_l.addWidget(QLabel("Input"))
            left_l.addWidget(self.path_label)
            left_l.addLayout(file_row)

            ctx_box = QGroupBox("Analysis context (required)")
            form = QFormLayout(ctx_box)
            self.analysis = QComboBox()
            self.analysis.addItems(
                [
                    "static_structural",
                    "buckling",
                    "modal",
                    "impact_crash",
                    "thermal",
                ]
            )
            self.solver = QComboBox()
            self.solver.addItems(
                ["generic_tet", "ansys_mechanical", "ls_dyna", "abaqus", "calculix"]
            )
            self.units = QComboBox()
            self.units.addItems(["m", "mm"])
            self.chk_contact = QCheckBox("Expects contact")
            self.chk_thin = QCheckBox("Thin-wall candidate")
            form.addRow("Analysis type", self.analysis)
            form.addRow("Target solver", self.solver)
            form.addRow("Source units", self.units)
            form.addRow(self.chk_contact)
            form.addRow(self.chk_thin)
            left_l.addWidget(ctx_box)

            left_l.addWidget(QLabel("Selectable regions (bbox faces in M1 demo)"))
            self.region_list = QListWidget()
            self.region_list.setSelectionMode(QListWidget.MultiSelection)
            self.region_list.itemSelectionChanged.connect(self._highlight_regions)
            left_l.addWidget(self.region_list)

            btn_load = QPushButton("Load & recommend strategies")
            btn_load.clicked.connect(self._load_and_recommend)
            left_l.addWidget(btn_load)

            left_l.addWidget(QLabel("Recommended / alternatives"))
            self.strategy_list = QListWidget()
            left_l.addWidget(self.strategy_list)

            self.warnings = QTextEdit()
            self.warnings.setReadOnly(True)
            self.warnings.setMaximumHeight(120)
            left_l.addWidget(self.warnings)

            btn_apply = QPushButton("Mesh selected strategy")
            btn_apply.clicked.connect(self._mesh_selected)
            btn_compare = QPushButton("Compare recommended + alternatives")
            btn_compare.clicked.connect(self._compare)
            left_l.addWidget(btn_apply)
            left_l.addWidget(btn_compare)

            left_l.addWidget(QLabel("Compare results"))
            self.table = QTableWidget(0, 5)
            self.table.setHorizontalHeaderLabels(
                ["Strategy", "Nodes", "Cells", "Max aspect", "Rules"]
            )
            left_l.addWidget(self.table)

            # --- Center viewer ---
            center = QWidget()
            center_l = QVBoxLayout(center)
            center_l.addWidget(
                QLabel(
                    "3D view — geometry outline / mesh. "
                    "STEP alone does not decide mesh strategy."
                )
            )
            self.plotter = QtInteractor(center)
            center_l.addWidget(self.plotter.interactor)

            splitter.addWidget(left)
            splitter.addWidget(center)
            splitter.setStretchFactor(0, 0)
            splitter.setStretchFactor(1, 1)

            self.statusBar().showMessage(
                "Load geometry, set analysis context, select regions, compare meshes."
            )
            self._load_fixture()

        def _browse(self) -> None:
            path, _ = QFileDialog.getOpenFileName(
                self,
                "Open STEP / fixture",
                str(fixture_dir()),
                "Geometry (*.step *.stp *.json);;All (*.*)",
            )
            if path:
                self._input_path = Path(path)
                self.path_label.setText(path)

        def _load_fixture(self) -> None:
            self._input_path = fixture_dir() / "unit_cube.step"
            self.path_label.setText(str(self._input_path))
            self._load_and_recommend()

        def _context(self) -> AnalysisContext:
            return AnalysisContext(
                analysis_type=self.analysis.currentText(),  # type: ignore[arg-type]
                solver_target=self.solver.currentText(),  # type: ignore[arg-type]
                expects_contact=self.chk_contact.isChecked(),
                thin_wall_candidate=self.chk_thin.isChecked(),
            )

        def _selected_region_ids(self) -> tuple[str, ...]:
            return tuple(i.data(Qt.UserRole) for i in self.region_list.selectedItems())

        def _load_and_recommend(self) -> None:
            try:
                ok = QMessageBox.question(
                    self,
                    "Confirm units",
                    f"Confirm source units are '{self.units.currentText()}' "
                    "and convert to SI metres?",
                )
                if ok != QMessageBox.Yes:
                    return
                self._geometry = import_geometry(
                    self._input_path,
                    units=self.units.currentText(),
                    confirm_units=True,
                )
                advisor = MeshStrategyAdvisor()
                self._regions = list(advisor.default_regions(self._geometry))
                self.region_list.clear()
                for r in self._regions:
                    item = QListWidgetItem(r.label)
                    item.setData(Qt.UserRole, r.region_id)
                    self.region_list.addItem(item)

                self._proposal = propose_strategies(
                    self._geometry, self._context(), self._selected_region_ids()
                )
                self._fill_strategies()
                self._show_geometry()
                self.statusBar().showMessage(
                    f"Loaded {self._geometry.solid_id} — strategies recommended"
                )
            except Exception as exc:
                QMessageBox.critical(self, "Load failed", str(exc))

        def _fill_strategies(self) -> None:
            self.strategy_list.clear()
            if not self._proposal:
                return
            rec = self._proposal.recommended
            item = QListWidgetItem(f"★ {rec.name}  [{rec.strategy_id}]")
            item.setData(Qt.UserRole, rec)
            self.strategy_list.addItem(item)
            for alt in self._proposal.alternatives:
                it = QListWidgetItem(f"  {alt.name}  [{alt.strategy_id}]")
                it.setData(Qt.UserRole, alt)
                self.strategy_list.addItem(it)
            self.strategy_list.setCurrentRow(0)
            self.warnings.setPlainText(
                "\n".join(self._proposal.warnings)
                + "\n\n"
                + rec.rationale
            )

        def _show_geometry(self) -> None:
            self.plotter.clear()
            if self._geometry is None:
                return
            outline = geometry_outline_polydata(self._geometry)
            self.plotter.add_mesh(outline, style="wireframe", color="black", line_width=2)
            if self._last_mesh is not None:
                grid = mesh_to_unstructured(self._last_mesh)
                self.plotter.add_mesh(grid, show_edges=True, opacity=0.55, color="lightblue")
            self._highlight_regions()
            self.plotter.reset_camera()

        def _highlight_regions(self) -> None:
            # Re-draw selection overlays
            if self._geometry is None:
                return
            # Keep base meshes; add translucent region boxes
            selected = set(self._selected_region_ids())
            for r in self._regions:
                if r.region_id not in selected:
                    continue
                box = region_box_polydata(r)
                if box is not None:
                    self.plotter.add_mesh(box, color="orange", opacity=0.25, name=r.region_id)

        def _mesh_selected(self) -> None:
            if self._geometry is None:
                QMessageBox.warning(self, "No geometry", "Load geometry first.")
                return
            item = self.strategy_list.currentItem()
            if item is None:
                QMessageBox.warning(self, "No strategy", "Select a strategy.")
                return
            strategy = item.data(Qt.UserRole)
            regions = self._selected_region_ids()
            strategy = replace(
                strategy,
                refine_region_ids=regions or strategy.refine_region_ids,
            )
            out = default_output_dir() / f"run_{datetime.now():%Y%m%d_%H%M%S}_{strategy.strategy_id}"
            try:
                run = run_with_strategy(self._geometry, strategy, out)
                self._last_mesh = run.mesh
                self._show_geometry()
                self.statusBar().showMessage(
                    f"{strategy.name}: {run.mesh.n_cells} cells → {out}"
                )
                QMessageBox.information(
                    self,
                    "Meshed",
                    f"{run.overall_status()}\ncells={run.mesh.n_cells}\n{out}",
                )
            except Exception as exc:
                QMessageBox.critical(self, "Mesh failed", str(exc))

        def _compare(self) -> None:
            if self._geometry is None or self._proposal is None:
                QMessageBox.warning(self, "Missing state", "Load & recommend first.")
                return
            # Re-propose with current selections
            self._proposal = propose_strategies(
                self._geometry, self._context(), self._selected_region_ids()
            )
            self._fill_strategies()
            strategies = [self._proposal.recommended, *self._proposal.alternatives]
            out = default_output_dir() / f"compare_{datetime.now():%Y%m%d_%H%M%S}"
            try:
                session = compare_strategies(
                    self._geometry,
                    self._context(),
                    strategies,
                    out,
                    selected_regions=list(self._selected_region_ids()),
                )
                self.table.setRowCount(0)
                for v in session.variants:
                    row = self.table.rowCount()
                    self.table.insertRow(row)
                    vals = [
                        v.strategy.name,
                        str(v.n_nodes),
                        str(v.n_cells),
                        f"{v.max_aspect_ratio:.3f}" if v.max_aspect_ratio is not None else "",
                        v.overall_rule_status,
                    ]
                    for col, val in enumerate(vals):
                        self.table.setItem(row, col, QTableWidgetItem(val))
                # Show recommended mesh
                from engcore.meshing.synthetic import SyntheticMesher

                self._last_mesh = SyntheticMesher().mesh_tet4(
                    self._geometry,
                    strategy=self._proposal.recommended,
                )
                self._show_geometry()
                self.statusBar().showMessage(f"Compared {len(session.variants)} strategies → {out}")
            except Exception as exc:
                QMessageBox.critical(self, "Compare failed", str(exc))

    app = QApplication.instance() or QApplication([])
    win = MainWindow()
    win.show()
    return app.exec()
