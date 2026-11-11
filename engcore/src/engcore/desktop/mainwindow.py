"""PySide6 main window — 3D viewer is the backbone of the workspace."""

from __future__ import annotations

import os
import sys
from dataclasses import replace
from datetime import datetime
from pathlib import Path

from engcore.domain.analysis import AnalysisContext
from engcore.geometry.features import detect_feature_hints
from engcore.geometry.regions import list_regions
from engcore.orchestration.pipeline import (
    compare_strategies,
    import_geometry,
    interpret_analysis_case,
    propose_strategies,
    run_with_strategy,
)
from engcore.paths import default_output_dir, fixture_dir


def run_desktop() -> int:
    from engcore.desktop.gl_bootstrap import (
        apply_qt_opengl_attributes,
        bootstrap_desktop_gl,
    )

    mode = bootstrap_desktop_gl()
    apply_qt_opengl_attributes()

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

    from engcore.desktop.viewer_host import ViewerHost

    class MainWindow(QMainWindow):
        def __init__(self) -> None:
            super().__init__()
            self.setWindowTitle("ENGINEERING//CORE — 3D mesh decision workspace")
            self.resize(1400, 860)

            self._geometry = None
            self._proposal = None
            self._brief = None
            self._regions = []
            self._features = []
            self._last_mesh = None
            self._compare_variants = []
            self._input_path = fixture_dir() / "plate_with_hole.json"

            root = QWidget()
            self.setCentralWidget(root)
            layout = QHBoxLayout(root)
            splitter = QSplitter()
            layout.addWidget(splitter)

            # --- Left controls (narrow) ---
            left = QWidget()
            left.setMinimumWidth(320)
            left.setMaximumWidth(440)
            left_l = QVBoxLayout(left)

            self.path_label = QLabel(str(self._input_path))
            self.path_label.setWordWrap(True)
            file_row = QHBoxLayout()
            btn_browse = QPushButton("Browse…")
            btn_browse.clicked.connect(self._browse)
            btn_plate = QPushButton("Plate+hole")
            btn_plate.clicked.connect(lambda: self._set_fixture("plate_with_hole.json"))
            btn_box = QPushButton("OCC box")
            btn_box.clicked.connect(lambda: self._set_fixture("box_occ.step"))
            file_row.addWidget(btn_browse)
            file_row.addWidget(btn_plate)
            file_row.addWidget(btn_box)
            left_l.addWidget(QLabel("Input"))
            left_l.addWidget(self.path_label)
            left_l.addLayout(file_row)

            ctx_box = QGroupBox("Analysis context (required — STEP alone is not enough)")
            form = QFormLayout(ctx_box)
            self.analysis = QComboBox()
            self.analysis.addItems(
                ["static_structural", "buckling", "modal", "impact_crash", "thermal"]
            )
            self.solver = QComboBox()
            self.solver.addItems(
                ["generic_tet", "ansys_mechanical", "ls_dyna", "abaqus", "calculix"]
            )
            self.units = QComboBox()
            self.units.addItems(["m", "mm"])
            self.chk_contact = QCheckBox("Expects contact")
            self.chk_thin = QCheckBox("Thin-wall candidate")
            self.chk_gmsh = QCheckBox("Prefer Gmsh/OCC when available")
            self.chk_gmsh.setChecked(True)
            form.addRow("Analysis type", self.analysis)
            form.addRow("Target solver", self.solver)
            form.addRow("Source units", self.units)
            form.addRow(self.chk_contact)
            form.addRow(self.chk_thin)
            form.addRow(self.chk_gmsh)
            left_l.addWidget(ctx_box)

            left_l.addWidget(QLabel("Selectable regions"))
            self.region_list = QListWidget()
            self.region_list.setSelectionMode(QListWidget.MultiSelection)
            self.region_list.itemSelectionChanged.connect(self._on_region_change)
            left_l.addWidget(self.region_list)

            left_l.addWidget(QLabel("Feature hints (DEMO)"))
            self.feature_box = QTextEdit()
            self.feature_box.setReadOnly(True)
            self.feature_box.setMaximumHeight(70)
            left_l.addWidget(self.feature_box)

            left_l.addWidget(QLabel("Case interpretation"))
            self.case_box = QTextEdit()
            self.case_box.setReadOnly(True)
            self.case_box.setMaximumHeight(110)
            left_l.addWidget(self.case_box)

            btn_load = QPushButton("Load & recommend strategies")
            btn_load.clicked.connect(self._load_and_recommend)
            left_l.addWidget(btn_load)

            left_l.addWidget(QLabel("Recommended / alternatives"))
            self.strategy_list = QListWidget()
            left_l.addWidget(self.strategy_list)

            self.warnings = QTextEdit()
            self.warnings.setReadOnly(True)
            self.warnings.setMaximumHeight(90)
            left_l.addWidget(self.warnings)

            btn_apply = QPushButton("Mesh selected strategy")
            btn_apply.clicked.connect(self._mesh_selected)
            btn_compare = QPushButton("Compare recommended + alternatives")
            btn_compare.clicked.connect(self._compare)
            left_l.addWidget(btn_apply)
            left_l.addWidget(btn_compare)

            left_l.addWidget(QLabel("Compare — click a row to show that mesh in 3D"))
            self.table = QTableWidget(0, 5)
            self.table.setHorizontalHeaderLabels(
                ["Strategy", "Nodes", "Cells", "Max aspect", "Rules"]
            )
            self.table.cellClicked.connect(self._on_variant_clicked)
            left_l.addWidget(self.table)

            # --- Center: mandatory 3D backbone ---
            center = QWidget()
            try:
                self.viewer = ViewerHost(center)
                self.viewer.smoke_render()
            except Exception as exc:
                QMessageBox.critical(self, "3D viewer required", str(exc))
                raise

            splitter.addWidget(left)
            splitter.addWidget(center)
            splitter.setStretchFactor(0, 1)
            splitter.setStretchFactor(1, 3)
            splitter.setSizes([360, 1040])

            self.statusBar().showMessage(f"3D workspace ready ({mode})")
            if os.environ.get("ENGCORE_DESKTOP_AUTOLOAD", "1") == "1":
                try:
                    self._load_and_recommend(confirm=False)
                except Exception:
                    pass

        def _set_fixture(self, name: str) -> None:
            self._input_path = fixture_dir() / name
            self.path_label.setText(str(self._input_path))
            self._load_and_recommend()

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

        def _context(self) -> AnalysisContext:
            return AnalysisContext(
                analysis_type=self.analysis.currentText(),  # type: ignore[arg-type]
                solver_target=self.solver.currentText(),  # type: ignore[arg-type]
                expects_contact=self.chk_contact.isChecked(),
                thin_wall_candidate=self.chk_thin.isChecked(),
            )

        def _selected_region_ids(self) -> tuple[str, ...]:
            return tuple(i.data(Qt.UserRole) for i in self.region_list.selectedItems())

        def _load_and_recommend(self, confirm: bool = True) -> None:
            try:
                if confirm:
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
                    prefer_gmsh=self.chk_gmsh.isChecked(),
                )
                self._regions = list(list_regions(self._geometry))
                self.region_list.clear()
                for r in self._regions:
                    item = QListWidgetItem(f"{r.label} [{r.kind}]")
                    item.setData(Qt.UserRole, r.region_id)
                    self.region_list.addItem(item)

                region_ids = tuple(r.region_id for r in self._regions)
                self._features = list(detect_feature_hints(self._geometry, region_ids))
                self.feature_box.setPlainText(
                    "\n".join(
                        f"• {f.kind}: {f.label} (conf={f.confidence:.2f})\n  {f.evidence}"
                        for f in self._features
                    )
                    or "No feature hints."
                )
                preselect = set()
                for f in self._features:
                    preselect.update(f.related_region_ids)
                for i in range(self.region_list.count()):
                    it = self.region_list.item(i)
                    if it.data(Qt.UserRole) in preselect:
                        it.setSelected(True)

                self._brief = interpret_analysis_case(
                    self._geometry,
                    self._context(),
                    regions=tuple(self._regions),
                    feature_hints=tuple(self._features),
                    selected_regions=self._selected_region_ids(),
                )
                self._fill_case_box()
                self._proposal = propose_strategies(
                    self._geometry,
                    self._context(),
                    self._selected_region_ids(),
                    feature_hints=tuple(self._features),
                    regions=tuple(self._regions),
                    brief=self._brief,
                )
                self._fill_strategies()
                self._last_mesh = None
                self._compare_variants = []
                self._show_geometry()
                self.statusBar().showMessage(
                    f"3D: {self._geometry.solid_id} ({self._geometry.backend}) · "
                    f"{len(self._regions)} regions · case conf={self._brief.confidence:.2f}"
                )
            except Exception as exc:
                QMessageBox.critical(self, "Load failed", str(exc))

        def _fill_case_box(self) -> None:
            if not self._brief:
                self.case_box.setPlainText("")
                return
            b = self._brief
            lines = [
                b.title,
                b.summary,
                "",
                "Primary method: " + b.primary_method.method_id,
                b.primary_method.notes,
                f"global={b.primary_method.global_size_m:.4g} m"
                + (
                    f" local={b.primary_method.local_size_m:.4g} m"
                    if b.primary_method.local_size_m
                    else ""
                ),
            ]
            if b.missing_inputs:
                lines.append("Missing: " + "; ".join(b.missing_inputs[:3]))
            self.case_box.setPlainText("\n".join(lines))

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
            short = [
                w
                for w in self._proposal.warnings
                if w.startswith("Missing") or w.startswith("Solver") or "DEMO" in w
            ]
            self.warnings.setPlainText("\n".join(short[:8]) + "\n\n" + rec.rationale)

        def _show_geometry(self) -> None:
            self.viewer.show_scene(
                self._geometry,
                self._last_mesh,
                regions=self._regions,
                selected_region_ids=self._selected_region_ids(),
            )

        def _on_region_change(self) -> None:
            if self._geometry is None:
                return
            self._show_geometry()

        def _mesh_selected(self) -> None:
            if self._geometry is None:
                QMessageBox.warning(self, "No geometry", "Load geometry first.")
                return
            item = self.strategy_list.currentItem()
            if item is None:
                QMessageBox.warning(self, "No strategy", "Select a strategy.")
                return
            strategy = replace(
                item.data(Qt.UserRole),
                refine_region_ids=self._selected_region_ids()
                or item.data(Qt.UserRole).refine_region_ids,
            )
            out = (
                default_output_dir()
                / f"run_{datetime.now():%Y%m%d_%H%M%S}_{strategy.strategy_id}"
            )
            try:
                run, review = run_with_strategy(
                    self._geometry, strategy, out, brief=self._brief
                )
                self._last_mesh = run.mesh
                self._show_geometry()
                msg = f"3D mesh: {strategy.name} · {run.mesh.n_cells} cells → {out}"
                if review:
                    msg += f" · {review.overall}"
                    self.warnings.setPlainText(review.narrative)
                self.statusBar().showMessage(msg)
            except Exception as exc:
                QMessageBox.critical(self, "Mesh failed", str(exc))

        def _compare(self) -> None:
            if self._geometry is None:
                QMessageBox.warning(self, "Missing state", "Load first.")
                return
            self._brief = interpret_analysis_case(
                self._geometry,
                self._context(),
                regions=tuple(self._regions),
                feature_hints=tuple(self._features),
                selected_regions=self._selected_region_ids(),
            )
            self._fill_case_box()
            self._proposal = propose_strategies(
                self._geometry,
                self._context(),
                self._selected_region_ids(),
                feature_hints=tuple(self._features),
                regions=tuple(self._regions),
                brief=self._brief,
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
                    brief=self._brief,
                )
                self._compare_variants = list(session.variants)
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
                if session.variants and session.variants[0].mesh is not None:
                    self._last_mesh = session.variants[0].mesh
                self._show_geometry()
                self.statusBar().showMessage(
                    f"3D compare: {len(session.variants)} strategies — click a row → {out}"
                )
            except Exception as exc:
                QMessageBox.critical(self, "Compare failed", str(exc))

        def _on_variant_clicked(self, row: int, _col: int) -> None:
            if row < 0 or row >= len(self._compare_variants):
                return
            variant = self._compare_variants[row]
            if variant.mesh is not None:
                self._last_mesh = variant.mesh
                self._show_geometry()
                self.statusBar().showMessage(
                    f"3D viewing {variant.strategy.name}: "
                    f"{variant.n_nodes} nodes / {variant.n_cells} cells"
                )

    app = QApplication.instance() or QApplication(sys.argv)
    try:
        win = MainWindow()
    except Exception:
        return 2
    win.show()
    return app.exec()
