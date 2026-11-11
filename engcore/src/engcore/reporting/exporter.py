"""JSON report + mesh artifact export with provenance."""

from __future__ import annotations

import json
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path

from engcore.domain.models import ArtifactPaths, PipelineRun, RuleStatus


class JsonReportExporter:
    def export(self, run: PipelineRun, out_dir: Path) -> ArtifactPaths:
        out_dir = Path(out_dir)
        out_dir.mkdir(parents=True, exist_ok=True)
        report_path = out_dir / "quality_report.json"
        mesh_path = out_dir / "mesh.json"

        report = {
            "schema": "engcore.quality_report.v1",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "run_id": run.run_id,
            "overall_status": run.overall_status(),
            "disclaimer": (
                "Geometric mesh quality PASS does not imply solver readiness "
                "or validated engineering suitability."
            ),
            "geometry": {
                "solid_id": run.geometry.solid_id,
                "source_path": run.geometry.source_path,
                "source_sha256": run.geometry.source_sha256,
                "volume_m3": run.geometry.volume_m3,
                "is_closed_solid": run.geometry.is_closed_solid,
                "backend": run.geometry.backend,
                "units": {
                    "source_unit": run.geometry.unit_policy.source_unit,
                    "confirmed_by_user": run.geometry.unit_policy.confirmed_by_user,
                    "scale_to_si": run.geometry.unit_policy.scale_to_si,
                },
            },
            "mesh": {
                "mesh_id": run.mesh.mesh_id,
                "n_nodes": run.mesh.n_nodes,
                "n_cells": run.mesh.n_cells,
                "element_type": run.mesh.element_type,
                "backend": run.mesh.backend,
            },
            "metrics": [asdict(m) for m in run.metrics.metrics],
            "rules": [
                {
                    **{k: (v.value if isinstance(v, RuleStatus) else v) for k, v in asdict(d).items()}
                }
                for d in run.decisions
            ],
        }
        report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")

        mesh_payload = {
            "schema": "engcore.mesh.v1",
            "mesh_id": run.mesh.mesh_id,
            "geometry_ref": run.mesh.geometry_ref,
            "element_type": run.mesh.element_type,
            "backend": run.mesh.backend,
            "nodes": [n.as_tuple() for n in run.mesh.nodes],
            "cells": [c.as_tuple() for c in run.mesh.cells],
            "units": "m",
        }
        mesh_path.write_text(json.dumps(mesh_payload, indent=2), encoding="utf-8")

        return ArtifactPaths(
            report_json=str(report_path.resolve()),
            mesh_json=str(mesh_path.resolve()),
            run_dir=str(out_dir.resolve()),
        )
