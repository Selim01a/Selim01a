"""Minimal Tk desktop binding for the M0 pipeline."""

from __future__ import annotations

import tempfile
from pathlib import Path

from engcore.orchestration.pipeline import run_pipeline

FIXTURES = Path(__file__).resolve().parents[3] / "tests" / "fixtures"


def _require_tk():
    try:
        import tkinter as tk
        from tkinter import filedialog, messagebox, ttk
    except ModuleNotFoundError as exc:
        raise SystemExit(
            "Tkinter is not available in this Python. "
            "Install python3-tk (Linux) or use the headless CLI: engcore run …"
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
        self.root.geometry("720x480")
        self._input = tk.StringVar(value=str(FIXTURES / "unit_cube.step"))
        self._units = tk.StringVar(value="m")
        self._status = tk.StringVar(value="Ready")
        self._build()

    def _build(self) -> None:
        tk, ttk = self._tk, self._ttk
        pad = {"padx": 8, "pady": 6}
        frm = ttk.Frame(self.root)
        frm.pack(fill=tk.BOTH, expand=True)

        ttk.Label(frm, text="ENGINEERING//CORE", font=("Segoe UI", 16, "bold")).pack(
            anchor="w", **pad
        )
        ttk.Label(
            frm,
            text="Offline STEP → TET4 → quality report (geometric metrics only)",
        ).pack(anchor="w", **pad)

        row = ttk.Frame(frm)
        row.pack(fill=tk.X, **pad)
        ttk.Entry(row, textvariable=self._input).pack(side=tk.LEFT, fill=tk.X, expand=True)
        ttk.Button(row, text="Browse…", command=self._browse).pack(side=tk.LEFT, padx=4)
        ttk.Button(row, text="Fixture", command=self._use_fixture).pack(side=tk.LEFT)

        unit_row = ttk.Frame(frm)
        unit_row.pack(fill=tk.X, **pad)
        ttk.Label(unit_row, text="Source units:").pack(side=tk.LEFT)
        ttk.Combobox(
            unit_row, textvariable=self._units, values=["m", "mm"], width=6, state="readonly"
        ).pack(side=tk.LEFT, padx=6)
        ttk.Label(unit_row, text="(explicit confirmation required on Run)").pack(side=tk.LEFT)

        ttk.Button(frm, text="Run pipeline", command=self._run).pack(anchor="w", **pad)
        ttk.Label(frm, textvariable=self._status, wraplength=680).pack(anchor="w", **pad)

        self._log = tk.Text(frm, height=16)
        self._log.pack(fill=tk.BOTH, expand=True, **pad)

    def _browse(self) -> None:
        path = self._filedialog.askopenfilename(
            filetypes=[("STEP / fixture", "*.step *.stp *.json"), ("All", "*.*")]
        )
        if path:
            self._input.set(path)

    def _use_fixture(self) -> None:
        self._input.set(str(FIXTURES / "unit_cube.step"))

    def _run(self) -> None:
        if not self._messagebox.askyesno(
            "Confirm units",
            f"Confirm that source units are '{self._units.get()}' and convert to SI metres?",
        ):
            self._status.set("Aborted: unit confirmation required.")
            return
        try:
            out = Path(tempfile.mkdtemp(prefix="engcore-ui-"))
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

        lines = [
            f"overall_status={run.overall_status()}",
            f"nodes={run.mesh.n_nodes} cells={run.mesh.n_cells}",
            f"report={run.artifacts.report_json if run.artifacts else ''}",
            "disclaimer: geometric PASS ≠ solver readiness",
            "",
            "Rules:",
        ]
        for d in run.decisions:
            lines.append(f"  {d.rule_id} [{d.maturity}] {d.status.value}: {d.evidence}")
        self._log.delete("1.0", self._tk.END)
        self._log.insert(self._tk.END, "\n".join(lines))
        self._status.set(f"Done: {run.overall_status()}")

    def mainloop(self) -> None:
        self.root.mainloop()


def main() -> None:
    app = EngCoreApp()
    app.mainloop()


if __name__ == "__main__":
    main()
