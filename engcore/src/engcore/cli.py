"""Headless CLI for ENGINEERING//CORE."""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict
from pathlib import Path

from engcore.domain.analysis import AnalysisContext
from engcore.geometry.features import detect_feature_hints
from engcore.geometry.regions import list_regions
from engcore.orchestration.pipeline import (
    compare_strategies,
    import_geometry,
    interpret_analysis_case,
    propose_strategies,
    run_pipeline,
)
from engcore.paths import fixture_dir


def _resolve_input(args: argparse.Namespace) -> Path:
    fixtures = fixture_dir()
    if args.fixture:
        mapping = {
            "unit-cube": fixtures / "unit_cube.step",
            "unit-cube-json": fixtures / "unit_cube.json",
            "open-solid": fixtures / "open_solid.json",
            "plate-with-hole": fixtures / "plate_with_hole.json",
            "box-occ": fixtures / "box_occ.step",
        }
        if args.fixture not in mapping:
            raise SystemExit(f"Unknown fixture: {args.fixture}. Choose from {list(mapping)}")
        return mapping[args.fixture]
    if not args.input:
        raise SystemExit("Provide --input PATH or --fixture NAME")
    return Path(args.input)


def _context_from_args(args: argparse.Namespace) -> AnalysisContext | None:
    if not getattr(args, "analysis", None):
        return None
    regions = tuple(r for r in (args.regions or "").split(",") if r)
    return AnalysisContext(
        analysis_type=args.analysis,
        solver_target=args.solver,
        critical_result_regions=regions,
        expects_contact=bool(args.expects_contact),
        thin_wall_candidate=bool(args.thin_wall),
    )


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="engcore", description="ENGINEERING//CORE CLI")
    sub = p.add_subparsers(dest="command", required=True)

    def add_common(cmd: argparse.ArgumentParser) -> None:
        cmd.add_argument("--input", type=Path, help="STEP or fixture JSON path")
        cmd.add_argument(
            "--fixture",
            choices=[
                "unit-cube",
                "unit-cube-json",
                "open-solid",
                "plate-with-hole",
                "box-occ",
            ],
            help="Use bundled synthetic fixture",
        )
        cmd.add_argument("--units", choices=["m", "mm"], default="m")
        cmd.add_argument("--confirm-units", action="store_true")
        cmd.add_argument("--gmsh", action="store_true")
        cmd.add_argument(
            "--analysis",
            choices=["static_structural", "buckling", "modal", "impact_crash", "thermal"],
            help="Analysis type (required for strategy recommendations)",
        )
        cmd.add_argument(
            "--solver",
            default="generic_tet",
            choices=["generic_tet", "ansys_mechanical", "ls_dyna", "abaqus", "calculix"],
        )
        cmd.add_argument("--regions", default="", help="Comma-separated region ids")
        cmd.add_argument("--expects-contact", action="store_true")
        cmd.add_argument("--thin-wall", action="store_true")

    run = sub.add_parser("run", help="Run STEP → strategy → mesh → report")
    add_common(run)
    run.add_argument("--out", type=Path, required=True)
    run.add_argument("--max-size", type=float, default=0.5)

    compare = sub.add_parser("compare", help="Compare recommended + alternative meshes")
    add_common(compare)
    compare.add_argument("--out", type=Path, required=True)

    interpret = sub.add_parser(
        "interpret", help="Interpret analysis case → mesh method brief (no mesh)"
    )
    add_common(interpret)

    return p


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    path = _resolve_input(args)
    ctx = _context_from_args(args)
    selected = tuple(r for r in (args.regions or "").split(",") if r)

    if args.command == "interpret":
        if ctx is None:
            print("ERROR: --analysis is required for interpret", file=sys.stderr)
            return 2
        try:
            geometry = import_geometry(
                path, units=args.units, confirm_units=args.confirm_units, prefer_gmsh=args.gmsh
            )
            regions = list_regions(geometry)
            hints = detect_feature_hints(geometry, tuple(r.region_id for r in regions))
            brief = interpret_analysis_case(
                geometry,
                ctx,
                regions=regions,
                feature_hints=hints,
                selected_regions=selected,
            )
        except Exception as exc:
            print(f"ERROR: {exc}", file=sys.stderr)
            return 2
        print(
            json.dumps(
                {
                    "title": brief.title,
                    "summary": brief.summary,
                    "confidence": brief.confidence,
                    "physics_drivers": list(brief.physics_drivers),
                    "mesh_drivers": list(brief.mesh_drivers),
                    "missing_inputs": list(brief.missing_inputs),
                    "solver_notes": list(brief.solver_notes),
                    "characteristic_length_m": brief.characteristic_length_m,
                    "feature_length_m": brief.feature_length_m,
                    "quality_targets": [asdict(t) for t in brief.quality_targets],
                    "primary_method": asdict(brief.primary_method),
                    "alternate_methods": [asdict(m) for m in brief.alternate_methods],
                },
                indent=2,
            )
        )
        return 0

    if args.command == "run":
        try:
            run = run_pipeline(
                path,
                args.out,
                units=args.units,
                confirm_units=args.confirm_units,
                max_size_m=args.max_size,
                prefer_gmsh=args.gmsh,
                context=ctx,
                selected_regions=selected,
            )
        except Exception as exc:
            print(f"ERROR: {exc}", file=sys.stderr)
            return 2
        summary = {
            "run_id": run.run_id,
            "overall_status": run.overall_status(),
            "strategy_id": run.mesh.strategy_id,
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

    if args.command == "compare":
        if ctx is None:
            print("ERROR: --analysis is required for compare", file=sys.stderr)
            return 2
        try:
            geometry = import_geometry(
                path, units=args.units, confirm_units=args.confirm_units, prefer_gmsh=args.gmsh
            )
            regions = list_regions(geometry)
            hints = detect_feature_hints(geometry, tuple(r.region_id for r in regions))
            brief = interpret_analysis_case(
                geometry,
                ctx,
                regions=regions,
                feature_hints=hints,
                selected_regions=selected,
            )
            proposal = propose_strategies(
                geometry,
                ctx,
                selected,
                feature_hints=hints,
                regions=regions,
                brief=brief,
            )
            strategies = [proposal.recommended, *proposal.alternatives]
            session = compare_strategies(
                geometry,
                ctx,
                strategies,
                args.out,
                selected_regions=list(selected),
                prefer_gmsh=args.gmsh,
                brief=brief,
            )
        except Exception as exc:
            print(f"ERROR: {exc}", file=sys.stderr)
            return 2
        print(
            json.dumps(
                {
                    "geometry_id": session.geometry_id,
                    "case": {
                        "title": brief.title,
                        "summary": brief.summary,
                        "confidence": brief.confidence,
                        "primary_method": brief.primary_method.method_id,
                    },
                    "reviews": session.feature_warnings,
                    "variants": [
                        {
                            "strategy_id": v.strategy.strategy_id,
                            "name": v.strategy.name,
                            "n_nodes": v.n_nodes,
                            "n_cells": v.n_cells,
                            "max_aspect_ratio": v.max_aspect_ratio,
                            "overall_rule_status": v.overall_rule_status,
                            "report": v.report_path,
                        }
                        for v in session.variants
                    ],
                },
                indent=2,
            )
        )
        return 0

    return 2


if __name__ == "__main__":
    raise SystemExit(main())
