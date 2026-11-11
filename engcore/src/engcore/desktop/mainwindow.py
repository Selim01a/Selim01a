"""PySide6 main window — clear STEP → analysis → mesh → export flow."""

from __future__ import annotations

import os
import sys
from dataclasses import replace
from datetime import datetime
from pathlib import Path

from engcore.domain.analysis import AnalysisContext
from engcore.geometry.factory import MissingGmshError, gmsh_available
from engcore.geometry.features import detect_feature_hints
from engcore.geometry.regions import list_regions
from engcore.orchestration.pipeline import (
    import_geometry,
    interpret_analysis_case,
    propose_strategies,
    run_with_strategy,
)
from engcore.paths import default_output_dir, fixture_dir
from engcore.reporting.mesh_export import export_meshed_geometry


def run_desktop() -> int:
    from engcore.desktop.gl_bootstrap import (
        apply_qt_opengl_attributes,
        bootstrap_desktop_gl,
    )

    mode = bootstrap_desktop_gl()
    apply_qt_opengl_attributes()

    from PySide6.QtCore import Qt
    from PySide6.QtGui import QFont
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
        QTextEdit,
        QVBoxLayout,
        QWidget,
    )

    from engcore.desktop.viewer_host import ViewerHost

    STEP_FILTER = "STEP files (*.step *.stp);;Fixtures (*.json);;All files (*.*)"

    class MainWindow(QMainWindow):
        def __init__(self) -> None:
            super().__init__()
            self.setWindowTitle("ENGINEERING//CORE — STEP → mesh")
            self.resize(1360, 840)

            self._geometry = None
            self._proposal = None
            self._brief = None
            self._regions = []
            self._features = []
            self._last_mesh = None
            self._last_run = None
            self._export_paths: dict[str, str] = {}
            self._input_path: Path | None = None

            root = QWidget()
            self.setCentralWidget(root)
            layout = QHBoxLayout(root)
            layout.setContentsMargins(8, 8, 8, 8)
            splitter = QSplitter()
            layout.addWidget(splitter)

            left = QWidget()
            left.setMinimumWidth(340)
            left.setMaximumWidth(420)
            left_l = QVBoxLayout(left)
            left_l.setSpacing(10)

            title = QLabel("STEP → analiz → mesh → çıktı")
            title_font = QFont()
            title_font.setPointSize(12)
            title_font.setBold(True)
            title.setFont(title_font)
            left_l.addWidget(title)
            subtitle = QLabel(
                "Amaç: STEP aç → analiz tipi/case anla → yüzeylere uygun mesh → meshli geometri ver."
            )
            subtitle.setWordWrap(True)
            subtitle.setStyleSheet("color: #555;")
            left_l.addWidget(subtitle)

            # --- 1. Open STEP ---
            step1 = QGroupBox("1 · STEP dosyası aç")
            s1 = QVBoxLayout(step1)
            self.path_label = QLabel("Henüz dosya seçilmedi")
            self.path_label.setWordWrap(True)
            self.path_label.setStyleSheet("font-family: monospace; font-size: 11px;")
            s1.addWidget(self.path_label)

            row = QHBoxLayout()
            btn_open = QPushButton("STEP seç…")
            btn_open.setDefault(True)
            btn_open.clicked.connect(self._browse_step)
            btn_demo = QPushButton("Demo (plate+hole)")
            btn_demo.clicked.connect(self._load_demo)
            row.addWidget(btn_open)
            row.addWidget(btn_demo)
            s1.addLayout(row)

            self.backend_label = QLabel(
                f"Gmsh/OCC: {'hazır' if gmsh_available() else 'yok — gerçek STEP için gerekli'}"
            )
            self.backend_label.setWordWrap(True)
            s1.addWidget(self.backend_label)

            units_row = QHBoxLayout()
            units_row.addWidget(QLabel("Kaynak birim"))
            self.units = QComboBox()
            self.units.addItems(["m", "mm"])
            units_row.addWidget(self.units)
            s1.addLayout(units_row)
            left_l.addWidget(step1)

            # --- 2. Analysis ---
            step2 = QGroupBox("2 · Analiz tipi ve case")
            form = QFormLayout(step2)
            self.analysis = QComboBox()
            self.analysis.addItems(
                ["static_structural", "buckling", "modal", "impact_crash", "thermal"]
            )
            self.solver = QComboBox()
            self.solver.addItems(
                ["generic_tet", "ansys_mechanical", "ls_dyna", "abaqus", "calculix"]
            )
            self.chk_contact = QCheckBox("Kontakt bekleniyor")
            self.chk_thin = QCheckBox("İnce duvar adayı")
            form.addRow("Analiz tipi", self.analysis)
            form.addRow("Hedef solver", self.solver)
            form.addRow(self.chk_contact)
            form.addRow(self.chk_thin)
            left_l.addWidget(step2)

            # --- 3. Surfaces + recommend ---
            step3 = QGroupBox("3 · Yüzeyler ve mesh stratejisi")
            s3 = QVBoxLayout(step3)
            self.region_list = QListWidget()
            self.region_list.setSelectionMode(QListWidget.MultiSelection)
            self.region_list.setMaximumHeight(100)
            self.region_list.itemSelectionChanged.connect(self._on_region_change)
            s3.addWidget(QLabel("İnce mesh uygulanacak yüzeyler"))
            s3.addWidget(self.region_list)

            self.case_box = QTextEdit()
            self.case_box.setReadOnly(True)
            self.case_box.setMaximumHeight(100)
            self.case_box.setPlaceholderText("Case yorumu burada görünecek…")
            s3.addWidget(self.case_box)

            self.strategy_list = QListWidget()
            self.strategy_list.setMaximumHeight(90)
            s3.addWidget(QLabel("Önerilen mesh stratejisi"))
            s3.addWidget(self.strategy_list)

            btn_analyze = QPushButton("Analiz et ve strateji öner")
            btn_analyze.clicked.connect(self._analyze)
            s3.addWidget(btn_analyze)
            left_l.addWidget(step3)

            # --- 4. Mesh + export ---
            step4 = QGroupBox("4 · Meshle ve çıktı al")
            s4 = QVBoxLayout(step4)
            btn_mesh = QPushButton("Mesh üret")
            btn_mesh.clicked.connect(self._mesh)
            btn_export = QPushButton("Meshli geometriyi dışa aktar…")
            btn_export.clicked.connect(self._export)
            s4.addWidget(btn_mesh)
            s4.addWidget(btn_export)
            self.export_label = QLabel("")
            self.export_label.setWordWrap(True)
            self.export_label.setStyleSheet("color: #333; font-size: 11px;")
            s4.addWidget(self.export_label)
            left_l.addWidget(step4)

            left_l.addStretch(1)

            # --- Center: 3D (ViewerHost is itself a QWidget) ---
            try:
                self.viewer = ViewerHost()
                self.viewer.smoke_render()
            except Exception as exc:
                QMessageBox.critical(self, "3D viewer required", str(exc))
                raise

            splitter.addWidget(left)
            splitter.addWidget(self.viewer)
            splitter.setStretchFactor(0, 1)
            splitter.setStretchFactor(1, 3)
            splitter.setSizes([380, 980])

            self.statusBar().showMessage(f"Hazır ({mode}) — STEP seçerek başla")
            if os.environ.get("ENGCORE_DESKTOP_AUTOLOAD", "0") == "1":
                try:
                    self._load_demo()
                except Exception:
                    pass

        def _context(self) -> AnalysisContext:
            return AnalysisContext(
                analysis_type=self.analysis.currentText(),  # type: ignore[arg-type]
                solver_target=self.solver.currentText(),  # type: ignore[arg-type]
                expects_contact=self.chk_contact.isChecked(),
                thin_wall_candidate=self.chk_thin.isChecked(),
            )

        def _selected_region_ids(self) -> tuple[str, ...]:
            return tuple(i.data(Qt.UserRole) for i in self.region_list.selectedItems())

        def _browse_step(self) -> None:
            start = str(self._input_path.parent) if self._input_path else str(Path.home())
            path, _ = QFileDialog.getOpenFileName(
                self, "STEP dosyası aç", start, STEP_FILTER
            )
            if not path:
                return
            self._input_path = Path(path)
            self.path_label.setText(str(self._input_path))
            self._analyze(confirm=True)

        def _load_demo(self) -> None:
            self._input_path = fixture_dir() / "plate_with_hole.json"
            self.path_label.setText(str(self._input_path))
            self._analyze(confirm=False)

        def _analyze(self, confirm: bool = True) -> None:
            if self._input_path is None:
                QMessageBox.information(self, "STEP yok", "Önce bir STEP dosyası seç.")
                return
            try:
                if confirm:
                    ok = QMessageBox.question(
                        self,
                        "Birimleri onayla",
                        f"Kaynak birim '{self.units.currentText()}' — SI metreye çevrilsin mi?",
                    )
                    if ok != QMessageBox.Yes:
                        return

                self._geometry = import_geometry(
                    self._input_path,
                    units=self.units.currentText(),
                    confirm_units=True,
                    prefer_gmsh=True,
                )
                self._regions = list(list_regions(self._geometry))
                self.region_list.clear()
                for r in self._regions:
                    item = QListWidgetItem(f"{r.label} [{r.kind}]")
                    item.setData(Qt.UserRole, r.region_id)
                    self.region_list.addItem(item)

                region_ids = tuple(r.region_id for r in self._regions)
                self._features = list(detect_feature_hints(self._geometry, region_ids))
                preselect: set[str] = set()
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
                self._last_run = None
                self._export_paths = {}
                self.export_label.setText("")
                self._show_geometry()
                backend = self._geometry.backend
                self.backend_label.setText(
                    f"Geometri backend: {backend} · "
                    f"Gmsh: {'hazır' if gmsh_available() else 'yok'}"
                )
                self.statusBar().showMessage(
                    f"{self._geometry.solid_id} ({backend}) · "
                    f"{len(self._regions)} yüzey · case conf={self._brief.confidence:.2f}"
                )
            except MissingGmshError as exc:
                QMessageBox.critical(self, "Gmsh gerekli", str(exc))
            except Exception as exc:
                QMessageBox.critical(self, "Açılış başarısız", str(exc))

        def _fill_case_box(self) -> None:
            if not self._brief:
                self.case_box.setPlainText("")
                return
            b = self._brief
            lines = [
                b.title,
                b.summary,
                "",
                f"Birincil yöntem: {b.primary_method.method_id}",
                b.primary_method.notes,
                f"global={b.primary_method.global_size_m:.4g} m"
                + (
                    f" · local={b.primary_method.local_size_m:.4g} m"
                    if b.primary_method.local_size_m
                    else ""
                ),
            ]
            if b.missing_inputs:
                lines.append("Eksik girdi: " + "; ".join(b.missing_inputs[:2]))
            self.case_box.setPlainText("\n".join(lines))

        def _fill_strategies(self) -> None:
            self.strategy_list.clear()
            if not self._proposal:
                return
            rec = self._proposal.recommended
            item = QListWidgetItem(f"★ {rec.name}")
            item.setData(Qt.UserRole, rec)
            self.strategy_list.addItem(item)
            for alt in self._proposal.alternatives:
                it = QListWidgetItem(f"  {alt.name}")
                it.setData(Qt.UserRole, alt)
                self.strategy_list.addItem(it)
            self.strategy_list.setCurrentRow(0)

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

        def _mesh(self) -> None:
            if self._geometry is None:
                QMessageBox.warning(self, "Geometri yok", "Önce STEP aç ve analiz et.")
                return
            # Refresh proposal with current region selection / analysis
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

            item = self.strategy_list.currentItem()
            if item is None:
                QMessageBox.warning(self, "Strateji yok", "Önce strateji öner.")
                return
            base = item.data(Qt.UserRole)
            strategy = replace(
                base,
                refine_region_ids=self._selected_region_ids() or base.refine_region_ids,
            )
            out = (
                default_output_dir()
                / f"run_{datetime.now():%Y%m%d_%H%M%S}_{strategy.strategy_id}"
            )
            try:
                run, review = run_with_strategy(
                    self._geometry,
                    strategy,
                    out,
                    prefer_gmsh=True,
                    brief=self._brief,
                )
                self._last_run = run
                self._last_mesh = run.mesh
                self._export_paths = export_meshed_geometry(run, out / "mesh_export")
                self._show_geometry()
                parts = [f"{k}: {Path(v).name}" for k, v in self._export_paths.items() if k != "manifest"]
                self.export_label.setText(
                    f"Çıktı klasörü:\n{out / 'mesh_export'}\n" + " · ".join(parts)
                )
                msg = f"Mesh: {strategy.name} · {run.mesh.n_nodes} düğüm / {run.mesh.n_cells} hücre"
                if review:
                    msg += f" · {review.overall}"
                self.statusBar().showMessage(msg)
            except Exception as exc:
                QMessageBox.critical(self, "Mesh başarısız", str(exc))

        def _export(self) -> None:
            if self._last_run is None:
                QMessageBox.information(
                    self, "Mesh yok", "Önce 'Mesh üret' ile mesh oluştur."
                )
                return
            dest = QFileDialog.getExistingDirectory(
                self, "Meshli geometri çıktı klasörü", str(default_output_dir())
            )
            if not dest:
                return
            try:
                paths = export_meshed_geometry(self._last_run, Path(dest))
                self._export_paths = paths
                self.export_label.setText(
                    "Dışa aktarıldı:\n"
                    + "\n".join(f"  {k}: {v}" for k, v in paths.items() if k != "manifest")
                )
                self.statusBar().showMessage(f"Export tamam → {dest}")
                QMessageBox.information(
                    self,
                    "Export tamam",
                    "Meshli geometri yazıldı:\n"
                    + "\n".join(f"• {k.upper()}: {Path(v).name}" for k, v in paths.items() if k != "manifest"),
                )
            except Exception as exc:
                QMessageBox.critical(self, "Export başarısız", str(exc))

    app = QApplication.instance() or QApplication(sys.argv)
    try:
        win = MainWindow()
    except Exception:
        return 2
    win.show()
    return app.exec()
