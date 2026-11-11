"""Headless CLI for ENGINEERING//CORE M0."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from engcore.orchestration.pipeline import run_pipeline

FIXTURES = Path(__file__).resolve().parents[2] / "tests" / "fixtures"


def _resolve_input(args: argparse.Namespace) -> Path:
    if args.fixture:
        mapping = {
            "unit-cube": FIXTURES / "unit_cube.step",
            "unit-cube-json": FIXTURES / "unit_cube.json",
            "open-solid": FIXTURES / "open_solid.json",
        }
        if args.fixture not in mapping:
            raise SystemExit(f"Unknown fixture: {args.fixture}. Choose from {list(mapping)}")
        return mapping[args.fixture]
    if not args.input:
        raise SystemExit("Provide --input PATH or --fixture NAME")
    return Path(args.input)


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="engcore", description="ENGINEERING//CORE M0 CLI")
    sub = p.add_subparsers(dest="command", required=True)

    run = sub.add_parser("run", help="Run STEP → mesh → quality → report pipeline")
    run.add_argument("--input", type=Path, help="STEP or fixture JSON path")
    run.add_argument(
        "--fixture",
        choices=["unit-cube", "unit-cube-json", "open-solid"],
        help="Use bundled synthetic fixture",
    )
    run.add_argument("--out", type=Path, required=True, help="Output directory")
    run.add_argument("--units", choices=["m", "mm"], default="m")
    run.add_argument(
        "--confirm-units",
        action="store_true",
        help="Explicitly confirm source units (required)",
    )
    run.add_argument("--max-size", type=float, default=0.5, help="Mesh size in metres")
    run.add_argument("--gmsh", action="store_true", help="Prefer Gmsh backend if installed")
    return p


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    if args.command == "run":
        try:
            path = _resolve_input(args)
            run = run_pipeline(
                path,
                args.out,
                units=args.units,
                confirm_units=args.confirm_units,
                max_size_m=args.max_size,
                prefer_gmsh=args.gmsh,
            )
        except Exception as exc:
            print(f"ERROR: {exc}", file=sys.stderr)
            return 2

        summary = {
            "run_id": run.run_id,
            "overall_status": run.overall_status(),
            "report": run.artifacts.report_json if run.artifacts else None,
            "mesh": run.artifacts.mesh_json if run.artifacts else None,
            "n_nodes": run.mesh.n_nodes,
            "n_cells": run.mesh.n_cells,
            "decisions": [
                {"rule_id": d.rule_id, "status": d.status.value, "maturity": d.maturity}
                for d in run.decisions
            ],
        }
        print(json.dumps(summary, indent=2))
        return 0 if run.overall_status() in {"PASS", "MIXED"} else 1
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
