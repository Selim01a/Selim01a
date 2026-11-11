"""Tk desktop binding for the M0 pipeline — demo-ready."""

from __future__ import annotations

import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path

from engcore.orchestration.pipeline import run_pipeline
from engcore.paths import default_output_dir, fixture_dir


def _require_tk():
    try:
        import tkinter as tk
        from tkinter import filedialog, messagebox, ttk
    except ModuleNotFoundError as exc:
        raise SystemExit(
            "Tkinter is not available in this Python. "
            "Install python3-tk (Linux) / ensure Tcl-Tk on Windows, "
            "or use the headless CLI: engcore run …"
        ) from exc
    return tk, filedialog, messagebox, ttk


class EngCoreApp:
    """Tk application constructed only when Tk is available."""

    def __init__(self) -> None:
        tk, filedialog, messagebox, ttk = _require_tk()
        self._tk = tk
        self._filedialog = filedialog
        self._messagebox = messagebox
        self._ttk = ttk
        self.root = tk.Tk()
        self.root.title("ENGINEERING//CORE M0")
        self.root.geometry("780x560")
        self.root.minsize(640, 480)

        fixture = fixture_dir() / "unit_cube.step"
        self._input = tk.StringVar(value=str(fixture if fixture.exists() else ""))
        self._out = tk.StringVar(value=str(default_output_dir()))
        self._units = tk.StringVar(value="m")
        self._status = tk.StringVar(value="Ready — load a STEP/fixture, confirm units, Run.")
        self._last_report: Path | None = None
        self._build()

    def _build(self) -> None:
        tk, ttk = self._tk, self._ttk
        pad = {"padx": 10, "pady": 6}
        frm = ttk.Frame(self.root, padding=8)
        frm.pack(fill=tk.BOTH, expand=True)

        ttk.Label(frm, text="ENGINEERING//CORE", font=("Segoe UI", 18, "bold")).pack(
            anchor="w", **pad
        )
        ttk.Label(
            frm,
            text="Offline STEP → TET4 mesh → quality report  ·  geometric metrics only "
            "(not solver validation)",
        ).pack(anchor="w", **pad)

        in_row = ttk.Frame(frm)
        in_row.pack(fill=tk.X, **pad)
        ttk.Label(in_row, text="Input", width=10).pack(side=tk.LEFT)
        ttk.Entry(in_row, textvariable=self._input).pack(side=tk.LEFT, fill=tk.X, expand=True)
        ttk.Button(in_row, text="Browse…", command=self._browse).pack(side=tk.LEFT, padx=4)
        ttk.Button(in_row, text="Demo fixture", command=self._use_fixture).pack(side=tk.LEFT)

        out_row = ttk.Frame(frm)
        out_row.pack(fill=tk.X, **pad)
        ttk.Label(out_row, text="Output", width=10).pack(side=tk.LEFT)
        ttk.Entry(out_row, textvariable=self._out).pack(side=tk.LEFT, fill=tk.X, expand=True)
        ttk.Button(out_row, text="Browse…", command=self._browse_out).pack(side=tk.LEFT, padx=4)

        unit_row = ttk.Frame(frm)
        unit_row.pack(fill=tk.X, **pad)
        ttk.Label(unit_row, text="Units", width=10).pack(side=tk.LEFT)
        ttk.Combobox(
            unit_row, textvariable=self._units, values=["m", "mm"], width=6, state="readonly"
        ).pack(side=tk.LEFT, padx=6)
        ttk.Label(unit_row, text="Source units (explicit confirm on Run)").pack(side=tk.LEFT)

        btn_row = ttk.Frame(frm)
        btn_row.pack(fill=tk.X, **pad)
        ttk.Button(btn_row, text="Run pipeline", command=self._run).pack(side=tk.LEFT)
        ttk.Button(btn_row, text="Open report folder", command=self._open_out).pack(
            side=tk.LEFT, padx=6
        )
        ttk.Button(btn_row, text="Open last report", command=self._open_report).pack(side=tk.LEFT)

        ttk.Label(frm, textvariable=self._status, wraplength=740).pack(anchor="w", **pad)

        self._log = tk.Text(frm, height=18, wrap="word")
        self._log.pack(fill=tk.BOTH, expand=True, **pad)
        self._log.insert(
            "1.0",
            "Tips:\n"
            "1) Click Demo fixture (or Browse a STEP/JSON)\n"
            "2) Confirm source units on Run\n"
            "3) Report + mesh JSON land in the Output folder\n",
        )

    def _browse(self) -> None:
        path = self._filedialog.askopenfilename(
            filetypes=[("STEP / fixture", "*.step *.stp *.json"), ("All", "*.*")]
        )
        if path:
            self._input.set(path)

    def _browse_out(self) -> None:
        path = self._filedialog.askdirectory(initialdir=self._out.get() or str(Path.home()))
        if path:
            self._out.set(path)

    def _use_fixture(self) -> None:
        path = fixture_dir() / "unit_cube.step"
        if not path.exists():
            self._messagebox.showerror("Missing fixture", f"Not found: {path}")
            return
        self._input.set(str(path))
        self._status.set(f"Loaded demo fixture: {path.name}")

    def _open_path(self, path: Path) -> None:
        path = Path(path)
        if not path.exists():
            self._messagebox.showwarning("Not found", str(path))
            return
        if sys.platform.startswith("win"):
            os.startfile(path)  # type: ignore[attr-defined]
        elif sys.platform == "darwin":
            subprocess.run(["open", str(path)], check=False)
        else:
            subprocess.run(["xdg-open", str(path)], check=False)

    def _open_out(self) -> None:
        self._open_path(Path(self._out.get()))

    def _open_report(self) -> None:
        if self._last_report is None:
            self._messagebox.showinfo("No report yet", "Run the pipeline first.")
            return
        self._open_path(self._last_report)

    def _run(self) -> None:
        if not self._input.get().strip():
            self._messagebox.showerror("Missing input", "Choose a STEP/fixture file first.")
            return
        if not self._messagebox.askyesno(
            "Confirm units",
            f"Confirm that source units are '{self._units.get()}' "
            "and convert to SI metres inside the core?",
        ):
            self._status.set("Aborted: unit confirmation required.")
            return

        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        out = Path(self._out.get()) / f"run_{stamp}"
        self._status.set("Running pipeline…")
        self.root.update_idletasks()
        try:
            run = run_pipeline(
                Path(self._input.get()),
                out,
                units=self._units.get(),
                confirm_units=True,
                max_size_m=0.5,
            )
        except Exception as exc:
            self._status.set(f"ERROR: {exc}")
            self._messagebox.showerror("Pipeline failed", str(exc))
            return

        self._last_report = Path(run.artifacts.report_json) if run.artifacts else None
        lines = [
            f"overall_status = {run.overall_status()}",
            f"nodes={run.mesh.n_nodes}  cells={run.mesh.n_cells}  backend={run.mesh.backend}",
            f"report = {run.artifacts.report_json if run.artifacts else ''}",
            f"mesh   = {run.artifacts.mesh_json if run.artifacts else ''}",
            "disclaimer: geometric PASS ≠ solver readiness",
            "",
            "Rules:",
        ]
        for d in run.decisions:
            lines.append(f"  {d.rule_id} [{d.maturity}] {d.status.value}: {d.evidence}")
        self._log.delete("1.0", self._tk.END)
        self._log.insert(self._tk.END, "\n".join(lines))
        self._status.set(f"Done: {run.overall_status()} → {out}")
        self._messagebox.showinfo(
            "Pipeline complete",
            f"Status: {run.overall_status()}\nOutput:\n{out}",
        )

    def mainloop(self) -> None:
        self.root.mainloop()


def main() -> None:
    app = EngCoreApp()
    app.mainloop()


if __name__ == "__main__":
    main()
