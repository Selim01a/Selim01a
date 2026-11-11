"""PySide6 main window — CAD import, feature tree, guided automation, mesh export."""

from __future__ import annotations

import os
import sys
from dataclasses import replace
from datetime import datetime
from pathlib import Path

from engcore.domain.analysis import AnalysisContext, MeshStrategy
from engcore.domain.models import MeshModel
from engcore.geometry.factory import MissingGmshError, gmsh_available
from engcore.geometry.features import detect_feature_hints
from engcore.geometry.regions import list_regions
from engcore.meshing.factory import get_mesher
from engcore.orchestration.automation import run_mesh_automation
from engcore.orchestration.pipeline import (
    import_geometry,
    interpret_analysis_case,
    propose_strategies,
    run_with_strategy,
)
from engcore.paths import default_output_dir, fixture_dir
from engcore.reporting.mesh_export import export_mesh_model, export_meshed_geometry
from engcore.standards.mesh_sizing import recommend_sizes


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
        QDoubleSpinBox,
        QFileDialog,
        QFormLayout,
        QGroupBox,
        QHBoxLayout,
        QLabel,
        QMainWindow,
        QMessageBox,
        QProgressBar,
        QPushButton,
        QScrollArea,
        QSplitter,
        QTextEdit,
        QTreeWidget,
        QTreeWidgetItem,
        QVBoxLayout,
        QWidget,
    )

    from engcore.desktop.viewer_host import ViewerHost

    STEP_FILTER = "STEP files (*.step *.stp);;Fixtures (*.json);;All files (*.*)"
    ROLE_KIND = Qt.UserRole
    ROLE_ID = Qt.UserRole + 1

    STYLES = """
    QMainWindow, QWidget#root { background: #F4F5F7; }
    QGroupBox {
        font-weight: 600;
        border: 1px solid #D0D5DD;
        border-radius: 6px;
        margin-top: 10px;
        padding: 10px 8px 8px 8px;
        background: #FFFFFF;
    }
    QGroupBox::title {
        subcontrol-origin: margin;
        left: 10px;
        padding: 0 4px;
        color: #1F2937;
    }
    QPushButton {
        background: #1F4E79;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 7px 12px;
        font-weight: 600;
    }
    QPushButton:hover { background: #163A5F; }
    QPushButton:disabled { background: #9CA3AF; }
    QPushButton#secondary {
        background: #EEF2F6;
        color: #1F2937;
        border: 1px solid #D0D5DD;
    }
    QPushButton#secondary:hover { background: #E5EAF0; }
    QPushButton#accent {
        background: #0F766E;
    }
    QPushButton#accent:hover { background: #0D9488; }
    QTreeWidget {
        border: 1px solid #D0D5DD;
        border-radius: 4px;
        background: #FAFBFC;
    }
    QLabel#stepRail {
        font-family: monospace;
        font-size: 11px;
        color: #374151;
        background: #F9FAFB;
        border: 1px solid #E5E7EB;
        border-radius: 4px;
        padding: 6px;
    }
    QLabel#brand {
        color: #111827;
    }
    QLabel#muted { color: #6B7280; }
    """

    class MainWindow(QMainWindow):
        def __init__(self) -> None:
            super().__init__()
            self.setWindowTitle("ENGINEERING//CORE")
            self.resize(1440, 880)
            self.setStyleSheet(STYLES)

            self._geometry = None
            self._regions = []
            self._features = []
            self._brief = None
            self._proposal = None
            self._meshes: list[MeshModel] = []
            self._last_run = None
            self._input_path: Path | None = None
            self._show_geometry = True
            self._hidden_regions: set[str] = set()
            self._hidden_meshes: set[str] = set()
            self._deleted_regions: set[str] = set()
            self._deleted_meshes: set[str] = set()
            self._auto_steps: list[tuple[str, str]] = []

            root = QWidget()
            root.setObjectName("root")
            self.setCentralWidget(root)
            layout = QHBoxLayout(root)
            layout.setContentsMargins(8, 8, 8, 8)
            splitter = QSplitter()
            layout.addWidget(splitter)

            # --- Left scroll panel ---
            scroll = QScrollArea()
            scroll.setWidgetResizable(True)
            scroll.setMinimumWidth(380)
            scroll.setMaximumWidth(480)
            left = QWidget()
            scroll.setWidget(left)
            left_l = QVBoxLayout(left)
            left_l.setSpacing(8)

            brand = QLabel("ENGINEERING//CORE")
            brand.setObjectName("brand")
            bf = QFont()
            bf.setPointSize(14)
            bf.setBold(True)
            brand.setFont(bf)
            left_l.addWidget(brand)
            sub = QLabel(
                "STEP → case anla → seçili yüzeye mesh → çıktı. "
                "Sen analizi seç; yazılım kalanı otomatikleştirir."
            )
            sub.setObjectName("muted")
            sub.setWordWrap(True)
            left_l.addWidget(sub)

            # Progress rail
            self.step_rail = QLabel("Bekleniyor: STEP import")
            self.step_rail.setObjectName("stepRail")
            self.step_rail.setWordWrap(True)
            left_l.addWidget(self.step_rail)
            self.progress = QProgressBar()
            self.progress.setRange(0, 5)
            self.progress.setValue(0)
            self.progress.setTextVisible(True)
            self.progress.setFormat("Adım %v / %m")
            left_l.addWidget(self.progress)

            # 1 Import
            g1 = QGroupBox("1 · Geometri")
            s1 = QVBoxLayout(g1)
            self.path_label = QLabel("Dosya seçilmedi")
            self.path_label.setWordWrap(True)
            self.path_label.setStyleSheet("font-family:monospace;font-size:11px;color:#374151;")
            s1.addWidget(self.path_label)
            row = QHBoxLayout()
            btn_open = QPushButton("STEP aç…")
            btn_open.clicked.connect(self._browse_step)
            btn_demo = QPushButton("Demo")
            btn_demo.setObjectName("secondary")
            btn_demo.clicked.connect(self._load_demo)
            row.addWidget(btn_open)
            row.addWidget(btn_demo)
            s1.addLayout(row)
            urow = QHBoxLayout()
            urow.addWidget(QLabel("Birim"))
            self.units = QComboBox()
            self.units.addItems(["m", "mm"])
            urow.addWidget(self.units)
            s1.addLayout(urow)
            self.backend_label = QLabel(
                f"Gmsh: {'hazır' if gmsh_available() else 'yok — gerçek STEP için kur'}"
            )
            self.backend_label.setObjectName("muted")
            self.backend_label.setWordWrap(True)
            s1.addWidget(self.backend_label)
            left_l.addWidget(g1)

            # Feature tree
            gtree = QGroupBox("Unsur ağacı")
            st = QVBoxLayout(gtree)
            self.tree = QTreeWidget()
            self.tree.setHeaderLabels(["Unsur", "Durum"])
            self.tree.setSelectionMode(QTreeWidget.ExtendedSelection)
            self.tree.itemSelectionChanged.connect(self._on_tree_selection)
            self.tree.itemChanged.connect(self._on_tree_item_changed)
            self.tree.setMinimumHeight(160)
            st.addWidget(self.tree)
            trow = QHBoxLayout()
            btn_hide = QPushButton("Gizle/Göster")
            btn_hide.setObjectName("secondary")
            btn_hide.clicked.connect(self._toggle_visibility)
            btn_del = QPushButton("Sil")
            btn_del.setObjectName("secondary")
            btn_del.clicked.connect(self._delete_selected)
            trow.addWidget(btn_hide)
            trow.addWidget(btn_del)
            st.addLayout(trow)
            left_l.addWidget(gtree)

            # 2 Case
            g2 = QGroupBox("2 · Analiz case")
            f2 = QFormLayout(g2)
            self.analysis = QComboBox()
            self.analysis.addItems(
                ["static_structural", "buckling", "modal", "impact_crash", "thermal"]
            )
            self.solver = QComboBox()
            self.solver.addItems(
                ["generic_tet", "ansys_mechanical", "ls_dyna", "abaqus", "calculix"]
            )
            self.chk_contact = QCheckBox("Kontakt")
            self.chk_thin = QCheckBox("İnce duvar / bending")
            f2.addRow("Analiz", self.analysis)
            f2.addRow("Solver", self.solver)
            f2.addRow(self.chk_contact)
            f2.addRow(self.chk_thin)
            left_l.addWidget(g2)

            # 3 Automation + manual
            g3 = QGroupBox("3 · Mesh otomasyonu")
            s3 = QVBoxLayout(g3)
            f3 = QFormLayout()
            self.element = QComboBox()
            self.element.addItems(["TRI3 (yüzey)", "TET4 (hacim)"])
            self.size_global = QDoubleSpinBox()
            self.size_global.setDecimals(6)
            self.size_global.setRange(1e-6, 1e3)
            self.size_global.setValue(0.05)
            self.size_global.setSuffix(" m")
            self.size_local = QDoubleSpinBox()
            self.size_local.setDecimals(6)
            self.size_local.setRange(0.0, 1e3)
            self.size_local.setSpecialValueText("(önerilen)")
            self.size_local.setValue(0.0)
            self.size_local.setSuffix(" m")
            f3.addRow("Eleman", self.element)
            f3.addRow("Global size", self.size_global)
            f3.addRow("Lokal size", self.size_local)
            s3.addLayout(f3)

            btn_auto = QPushButton("Otomatik çalıştır")
            btn_auto.setObjectName("accent")
            btn_auto.setToolTip(
                "Özellik tespit → kritik yüzey seç → size öner → mesh → export"
            )
            btn_auto.clicked.connect(self._run_automation)
            s3.addWidget(btn_auto)

            brow = QHBoxLayout()
            btn_suggest = QPushButton("Sadece size öner")
            btn_suggest.setObjectName("secondary")
            btn_suggest.clicked.connect(self._suggest_sizes)
            btn_mesh = QPushButton("Seçiliye mesh")
            btn_mesh.setObjectName("secondary")
            btn_mesh.clicked.connect(self._apply_mesh)
            brow.addWidget(btn_suggest)
            brow.addWidget(btn_mesh)
            s3.addLayout(brow)

            btn_export = QPushButton("Mesh çıktısı…")
            btn_export.setObjectName("secondary")
            btn_export.clicked.connect(self._export)
            s3.addWidget(btn_export)

            self.advice_box = QTextEdit()
            self.advice_box.setReadOnly(True)
            self.advice_box.setMaximumHeight(100)
            self.advice_box.setPlaceholderText(
                "Otomasyon / size gerekçesi (Autodesk·ICEMM·MSC·NAFEMS)…"
            )
            s3.addWidget(self.advice_box)
            self.export_label = QLabel("")
            self.export_label.setObjectName("muted")
            self.export_label.setWordWrap(True)
            s3.addWidget(self.export_label)
            left_l.addWidget(g3)
            left_l.addStretch(1)

            try:
                self.viewer = ViewerHost()
                self.viewer.smoke_render()
            except Exception as exc:
                QMessageBox.critical(self, "3D viewer required", str(exc))
                raise

            splitter.addWidget(scroll)
            splitter.addWidget(self.viewer)
            splitter.setStretchFactor(0, 1)
            splitter.setStretchFactor(1, 3)
            splitter.setSizes([420, 1020])
            self.statusBar().showMessage(f"Hazır ({mode})")
            self._set_rail("Bekleniyor: STEP import", 0)

            if os.environ.get("ENGCORE_DESKTOP_AUTOLOAD", "0") == "1":
                try:
                    self._load_demo()
                except Exception:
                    pass

        def _set_rail(self, text: str, step: int) -> None:
            self.step_rail.setText(text)
            self.progress.setValue(max(0, min(5, step)))

        def _context(self) -> AnalysisContext:
            return AnalysisContext(
                analysis_type=self.analysis.currentText(),  # type: ignore[arg-type]
                solver_target=self.solver.currentText(),  # type: ignore[arg-type]
                expects_contact=self.chk_contact.isChecked(),
                thin_wall_candidate=self.chk_thin.isChecked(),
            )

        def _active_regions(self):
            return [r for r in self._regions if r.region_id not in self._deleted_regions]

        def _selected_face_ids(self) -> tuple[str, ...]:
            ids: list[str] = []
            for item in self.tree.selectedItems():
                if item.data(0, ROLE_KIND) == "face":
                    rid = item.data(0, ROLE_ID)
                    if rid and rid not in self._deleted_regions:
                        ids.append(rid)
            return tuple(dict.fromkeys(ids))

        def _browse_step(self) -> None:
            start = str(self._input_path.parent) if self._input_path else str(Path.home())
            path, _ = QFileDialog.getOpenFileName(self, "STEP aç", start, STEP_FILTER)
            if not path:
                return
            self._input_path = Path(path)
            self.path_label.setText(str(self._input_path))
            self._import_geometry(confirm=True)

        def _load_demo(self) -> None:
            self._input_path = fixture_dir() / "plate_with_hole.json"
            self.path_label.setText(str(self._input_path))
            self._import_geometry(confirm=False)

        def _import_geometry(self, confirm: bool = True) -> None:
            if self._input_path is None:
                return
            try:
                if confirm:
                    ok = QMessageBox.question(
                        self,
                        "Birimleri onayla",
                        f"Kaynak birim '{self.units.currentText()}' → SI m?",
                    )
                    if ok != QMessageBox.Yes:
                        return
                self._set_rail("Import…", 0)
                self._geometry = import_geometry(
                    self._input_path,
                    units=self.units.currentText(),
                    confirm_units=True,
                    prefer_gmsh=True,
                )
                self._regions = list(list_regions(self._geometry))
                region_ids = tuple(r.region_id for r in self._regions)
                self._features = list(detect_feature_hints(self._geometry, region_ids))
                self._meshes = []
                self._last_run = None
                self._show_geometry = True
                self._hidden_regions.clear()
                self._hidden_meshes.clear()
                self._deleted_regions.clear()
                self._deleted_meshes.clear()
                self._rebuild_tree()
                self._refresh_view()
                self.backend_label.setText(
                    f"Backend: {self._geometry.backend} · "
                    f"{len(self._regions)} yüzey · mesh yok"
                )
                self._set_rail(
                    f"Geometri hazır · {self._geometry.solid_id}\n"
                    "Sonraki: analiz tipini seç → Otomatik çalıştır",
                    1,
                )
                self.statusBar().showMessage("CAD import tamam — mesh henüz yok")
            except MissingGmshError as exc:
                QMessageBox.critical(self, "Gmsh gerekli", str(exc))
            except Exception as exc:
                QMessageBox.critical(self, "Import başarısız", str(exc))

        def _rebuild_tree(self) -> None:
            self.tree.blockSignals(True)
            self.tree.clear()
            if self._geometry is None:
                self.tree.blockSignals(False)
                return
            geom = QTreeWidgetItem(
                ["Geometri", "görünür" if self._show_geometry else "gizli"]
            )
            geom.setData(0, ROLE_KIND, "geometry")
            geom.setData(0, ROLE_ID, self._geometry.solid_id)
            geom.setFlags(geom.flags() | Qt.ItemIsUserCheckable)
            geom.setCheckState(0, Qt.Checked if self._show_geometry else Qt.Unchecked)
            self.tree.addTopLevelItem(geom)

            faces_root = QTreeWidgetItem(["Yüzeyler", f"{len(self._active_regions())}"])
            faces_root.setData(0, ROLE_KIND, "faces_root")
            geom.addChild(faces_root)
            for r in self._active_regions():
                hidden = r.region_id in self._hidden_regions
                item = QTreeWidgetItem([r.label, "gizli" if hidden else "görünür"])
                item.setData(0, ROLE_KIND, "face")
                item.setData(0, ROLE_ID, r.region_id)
                item.setFlags(item.flags() | Qt.ItemIsUserCheckable | Qt.ItemIsSelectable)
                item.setCheckState(0, Qt.Unchecked if hidden else Qt.Checked)
                faces_root.addChild(item)

            meshes_root = QTreeWidgetItem(["Meshler", ""])
            meshes_root.setData(0, ROLE_KIND, "meshes_root")
            geom.addChild(meshes_root)
            for m in self._meshes:
                if m.mesh_id in self._deleted_meshes:
                    continue
                hidden = m.mesh_id in self._hidden_meshes
                label = f"{m.element_type} · {m.n_cells} el"
                item = QTreeWidgetItem([label, "gizli" if hidden else "görünür"])
                item.setData(0, ROLE_KIND, "mesh")
                item.setData(0, ROLE_ID, m.mesh_id)
                item.setFlags(item.flags() | Qt.ItemIsUserCheckable | Qt.ItemIsSelectable)
                item.setCheckState(0, Qt.Unchecked if hidden else Qt.Checked)
                meshes_root.addChild(item)

            self.tree.expandAll()
            self.tree.blockSignals(False)

        def _select_faces_in_tree(self, face_ids: tuple[str, ...]) -> None:
            want = set(face_ids)
            self.tree.clearSelection()
            root = self.tree.invisibleRootItem()
            stack = [root.child(i) for i in range(root.childCount())]
            while stack:
                item = stack.pop()
                for i in range(item.childCount()):
                    stack.append(item.child(i))
                if item.data(0, ROLE_KIND) == "face" and item.data(0, ROLE_ID) in want:
                    item.setSelected(True)

        def _refresh_view(self) -> None:
            visible_meshes = [
                m
                for m in self._meshes
                if m.mesh_id not in self._deleted_meshes
                and m.mesh_id not in self._hidden_meshes
            ]
            self.viewer.show_scene(
                self._geometry,
                meshes=visible_meshes,
                regions=self._active_regions(),
                selected_region_ids=self._selected_face_ids(),
                show_geometry=self._show_geometry,
                hidden_region_ids=self._hidden_regions,
            )

        def _on_tree_selection(self) -> None:
            self._refresh_view()

        def _on_tree_item_changed(self, item: QTreeWidgetItem, _col: int) -> None:
            kind = item.data(0, ROLE_KIND)
            checked = item.checkState(0) == Qt.Checked
            if kind == "geometry":
                self._show_geometry = checked
                item.setText(1, "görünür" if checked else "gizli")
            elif kind == "face":
                rid = item.data(0, ROLE_ID)
                if checked:
                    self._hidden_regions.discard(rid)
                else:
                    self._hidden_regions.add(rid)
                item.setText(1, "görünür" if checked else "gizli")
            elif kind == "mesh":
                mid = item.data(0, ROLE_ID)
                if checked:
                    self._hidden_meshes.discard(mid)
                else:
                    self._hidden_meshes.add(mid)
                item.setText(1, "görünür" if checked else "gizli")
            self._refresh_view()

        def _toggle_visibility(self) -> None:
            for item in self.tree.selectedItems():
                if item.data(0, ROLE_KIND) not in {"geometry", "face", "mesh"}:
                    continue
                new_state = Qt.Unchecked if item.checkState(0) == Qt.Checked else Qt.Checked
                item.setCheckState(0, new_state)

        def _delete_selected(self) -> None:
            for item in self.tree.selectedItems():
                kind = item.data(0, ROLE_KIND)
                oid = item.data(0, ROLE_ID)
                if kind == "face" and oid:
                    self._deleted_regions.add(oid)
                    self._hidden_regions.discard(oid)
                elif kind == "mesh" and oid:
                    self._deleted_meshes.add(oid)
                    self._meshes = [m for m in self._meshes if m.mesh_id != oid]
                    self._hidden_meshes.discard(oid)
                elif kind == "geometry":
                    self._geometry = None
                    self._regions = []
                    self._meshes = []
                    self._show_geometry = False
            self._rebuild_tree()
            self._refresh_view()

        def _run_automation(self) -> None:
            if self._geometry is None:
                QMessageBox.information(self, "Geometri yok", "Önce STEP import et.")
                return
            et = "TRI3" if self.element.currentIndex() == 0 else "TET4"
            lines = ["Otomasyon başladı…"]

            def on_progress(step_id: str, status: str, detail: str) -> None:
                mark = {
                    "running": "…",
                    "done": "✓",
                    "error": "✗",
                    "skipped": "–",
                    "pending": "·",
                }.get(status, "·")
                step_no = {
                    "detect_features": 1,
                    "select_faces": 2,
                    "recommend_size": 3,
                    "generate_mesh": 4,
                    "export": 5,
                    "done": 5,
                }.get(step_id, 0)
                lines.append(f"{mark} {step_id}: {detail}")
                self._set_rail("\n".join(lines[-6:]), step_no)
                QApplication.processEvents()

            try:
                local = float(self.size_local.value()) or None
                # Prefer current tree selection if user already picked faces
                sel = self._selected_face_ids() or None
                result = run_mesh_automation(
                    self._geometry,
                    self._context(),
                    element_type=et,  # type: ignore[arg-type]
                    out_root=default_output_dir(),
                    user_global_size_m=float(self.size_global.value()),
                    user_local_size_m=local,
                    selected_faces=sel,
                    progress=on_progress,
                )
                self._regions = list(result.regions)
                self._features = list(result.features)
                self._brief = result.brief
                self._meshes.append(result.mesh)
                self._last_run = result.run
                self.size_global.setValue(result.size_plan.global_size_m)
                if result.size_plan.local_size_m:
                    self.size_local.setValue(result.size_plan.local_size_m)
                self.advice_box.setPlainText(
                    result.size_plan.rationale
                    + "\n\n"
                    + "\n".join(f"• {c}" for c in result.size_plan.citations)
                )
                self._rebuild_tree()
                self._select_faces_in_tree(result.selected_faces)
                self._refresh_view()
                out = result.out_dir / "mesh_export" if result.out_dir else Path(".")
                self.export_label.setText(
                    f"Otomasyon çıktı: {out}\n"
                    f"{result.mesh.element_type} · {result.mesh.n_cells} eleman"
                )
                self.statusBar().showMessage(
                    f"Otomasyon tamam · {result.mesh.element_type} · {result.mesh.n_cells} el"
                )
            except Exception as exc:
                self._set_rail(f"Otomasyon hata: {exc}", self.progress.value())
                QMessageBox.critical(self, "Otomasyon başarısız", str(exc))

        def _suggest_sizes(self) -> None:
            if self._geometry is None:
                return
            et = "TRI3" if self.element.currentIndex() == 0 else "TET4"
            plan = recommend_sizes(
                self._geometry,
                self._context(),
                element_type=et,  # type: ignore[arg-type]
                feature_hints=tuple(self._features),
                regions=tuple(self._active_regions()),
                selected_region_ids=self._selected_face_ids(),
            )
            self.size_global.setValue(plan.global_size_m)
            if plan.local_size_m:
                self.size_local.setValue(plan.local_size_m)
            self.advice_box.setPlainText(
                plan.rationale + "\n\n" + "\n".join(f"• {c}" for c in plan.citations)
            )
            self._set_rail("Size önerildi — mesh için Otomatik veya Seçiliye mesh", 3)
            try:
                self._brief = interpret_analysis_case(
                    self._geometry,
                    self._context(),
                    regions=tuple(self._active_regions()),
                    feature_hints=tuple(self._features),
                    selected_regions=self._selected_face_ids(),
                )
                self._proposal = propose_strategies(
                    self._geometry,
                    self._context(),
                    self._selected_face_ids(),
                    feature_hints=tuple(self._features),
                    regions=tuple(self._active_regions()),
                    brief=self._brief,
                )
            except Exception:
                self._brief = None
                self._proposal = None

        def _apply_mesh(self) -> None:
            if self._geometry is None:
                QMessageBox.warning(self, "Geometri yok", "Önce STEP import et.")
                return
            faces = self._selected_face_ids()
            et_surface = self.element.currentIndex() == 0
            if et_surface and not faces:
                QMessageBox.information(
                    self, "Yüzey seç", "Unsur ağacından en az bir yüzey seç."
                )
                return

            global_size = float(self.size_global.value())
            local_size = float(self.size_local.value()) or None
            mesher = get_mesher(prefer_gmsh=True, geometry=self._geometry)

            try:
                self._set_rail("Manuel mesh…", 4)
                if et_surface:
                    size = local_size or global_size
                    try:
                        mesh = mesher.mesh_surface_tri3(  # type: ignore[attr-defined]
                            self._geometry,
                            face_region_ids=faces,
                            size_m=size,
                            regions=tuple(self._active_regions()),
                        )
                    except TypeError:
                        mesh = mesher.mesh_surface_tri3(  # type: ignore[attr-defined]
                            self._geometry, face_region_ids=faces, size_m=size
                        )
                    self._meshes.append(mesh)
                    self._last_run = None
                    out = (
                        default_output_dir()
                        / f"surf_{datetime.now():%Y%m%d_%H%M%S}_{mesh.mesh_id}"
                    )
                    export_mesh_model(mesh, out)
                    self.export_label.setText(f"Yüzey mesh → {out.name}")
                    self.statusBar().showMessage(
                        f"TRI3 · {mesh.n_cells} el · {size:.4g} m"
                    )
                else:
                    if self._proposal is None:
                        self._suggest_sizes()
                    base = (
                        self._proposal.recommended
                        if self._proposal
                        else MeshStrategy(
                            strategy_id="user-tet",
                            name="User TET4",
                            element_family="TET4",
                            global_size_m=global_size,
                            local_size_m=local_size,
                            refine_region_ids=faces,
                            rationale="User-specified sizes",
                            confidence=0.5,
                        )
                    )
                    strategy = replace(
                        base,
                        global_size_m=global_size,
                        local_size_m=local_size or base.local_size_m,
                        refine_region_ids=faces or base.refine_region_ids,
                    )
                    out = (
                        default_output_dir()
                        / f"run_{datetime.now():%Y%m%d_%H%M%S}_{strategy.strategy_id}"
                    )
                    run, review = run_with_strategy(
                        self._geometry,
                        strategy,
                        out,
                        prefer_gmsh=True,
                        brief=self._brief,
                    )
                    self._last_run = run
                    self._meshes.append(run.mesh)
                    export_meshed_geometry(run, out / "mesh_export")
                    msg = f"TET4 · {run.mesh.n_cells} el"
                    if review:
                        msg += f" · {review.overall}"
                    self.export_label.setText(msg)
                    self.statusBar().showMessage(msg)

                self._rebuild_tree()
                self._refresh_view()
                self._set_rail("Mesh hazır · export isteğe bağlı", 5)
            except Exception as exc:
                QMessageBox.critical(self, "Mesh başarısız", str(exc))

        def _export(self) -> None:
            visible = [m for m in self._meshes if m.mesh_id not in self._deleted_meshes]
            if not visible and self._last_run is None:
                QMessageBox.information(self, "Mesh yok", "Önce mesh uygula.")
                return
            dest = QFileDialog.getExistingDirectory(
                self, "Mesh çıktı klasörü", str(default_output_dir())
            )
            if not dest:
                return
            try:
                if self._last_run is not None:
                    paths = export_meshed_geometry(self._last_run, Path(dest))
                else:
                    paths = export_mesh_model(visible[-1], Path(dest))
                self.export_label.setText(
                    "Export:\n"
                    + "\n".join(f"{k}: {Path(v).name}" for k, v in paths.items())
                )
                QMessageBox.information(self, "Export tamam", f"Yazıldı → {dest}")
            except Exception as exc:
                QMessageBox.critical(self, "Export başarısız", str(exc))

    app = QApplication.instance() or QApplication(sys.argv)
    try:
        win = MainWindow()
    except Exception:
        return 2
    win.show()
    return app.exec()
