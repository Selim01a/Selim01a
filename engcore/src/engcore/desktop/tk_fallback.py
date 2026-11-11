"""Minimal Tk fallback when PySide6/PyVista are not installed."""

from __future__ import annotations

from datetime import datetime
from pathlib import Path

from engcore.domain.analysis import AnalysisContext
from engcore.orchestration.pipeline import propose_strategies, run_pipeline
from engcore.paths import default_output_dir, fixture_dir


def _require_tk():
    try:
        import tkinter as tk
        from tkinter import filedialog, messagebox, ttk
    except ModuleNotFoundError as exc:
        raise SystemExit(
            "Neither PySide6 nor Tkinter available. "
            "Install desktop extras: pip install -e '.[desktop]'"
        ) from exc
    return tk, filedialog, messagebox, ttk


class EngCoreApp:
    def __init__(self) -> None:
        tk, filedialog, messagebox, ttk = _require_tk()
        self._tk = tk
        self._filedialog = filedialog
        self._messagebox = messagebox
        self._ttk = ttk
        self.root = tk.Tk()
        self.root.title("ENGINEERING//CORE (Tk fallback)")
        self.root.geometry("780x560")
        self._input = tk.StringVar(value=str(fixture_dir() / "unit_cube.step"))
        self._out = tk.StringVar(value=str(default_output_dir()))
        self._units = tk.StringVar(value="m")
        self._analysis = tk.StringVar(value="static_structural")
        self._status = tk.StringVar(value="Tk fallback — install .[desktop] for 3D viewer")
        self._build()

    def _build(self) -> None:
        tk, ttk = self._tk, self._ttk
        pad = {"padx": 10, "pady": 6}
        frm = ttk.Frame(self.root, padding=8)
        frm.pack(fill=tk.BOTH, expand=True)
        ttk.Label(frm, text="ENGINEERING//CORE (fallback)", font=("Segoe UI", 16, "bold")).pack(
            anchor="w", **pad
        )
        row = ttk.Frame(frm)
        row.pack(fill=tk.X, **pad)
        ttk.Entry(row, textvariable=self._input).pack(side=tk.LEFT, fill=tk.X, expand=True)
        ttk.Button(row, text="Fixture", command=lambda: self._input.set(str(fixture_dir() / "unit_cube.step"))).pack(
            side=tk.LEFT
        )
        unit_row = ttk.Frame(frm)
        unit_row.pack(fill=tk.X, **pad)
        ttk.Combobox(unit_row, textvariable=self._units, values=["m", "mm"], width=6).pack(
            side=tk.LEFT
        )
        ttk.Combobox(
            unit_row,
            textvariable=self._analysis,
            values=["static_structural", "buckling", "modal", "impact_crash", "thermal"],
            width=20,
        ).pack(side=tk.LEFT, padx=8)
        ttk.Button(frm, text="Run recommended strategy", command=self._run).pack(anchor="w", **pad)
        ttk.Label(frm, textvariable=self._status, wraplength=740).pack(anchor="w", **pad)
        self._log = tk.Text(frm, height=18)
        self._log.pack(fill=tk.BOTH, expand=True, **pad)

    def _run(self) -> None:
        if not self._messagebox.askyesno("Confirm units", f"Confirm units={self._units.get()}?"):
            return
        out = Path(self._out.get()) / f"run_{datetime.now():%Y%m%d_%H%M%S}"
        ctx = AnalysisContext(
            analysis_type=self._analysis.get(),  # type: ignore[arg-type]
            solver_target="generic_tet",
        )
        try:
            run = run_pipeline(
                Path(self._input.get()),
                out,
                units=self._units.get(),
                confirm_units=True,
                context=ctx,
            )
        except Exception as exc:
            self._messagebox.showerror("Failed", str(exc))
            return
        self._log.delete("1.0", self._tk.END)
        self._log.insert(
            self._tk.END,
            f"{run.overall_status()} strategy={run.mesh.strategy_id} "
            f"cells={run.mesh.n_cells}\n{out}\n",
        )
        self._status.set(f"Done: {run.overall_status()}")

    def mainloop(self) -> None:
        self.root.mainloop()


def main() -> None:
    EngCoreApp().mainloop()
