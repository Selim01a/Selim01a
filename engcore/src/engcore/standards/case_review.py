"""Review a produced mesh against the interpreted case targets (DEMO)."""

from __future__ import annotations

from engcore.domain.case_brief import AnalysisCaseBrief, CaseMeshReview, QualityTarget
from engcore.domain.models import MetricSet


_OPS = {
    "gt": lambda a, b: a > b,
    "ge": lambda a, b: a >= b,
    "lt": lambda a, b: a < b,
    "le": lambda a, b: a <= b,
}


def review_mesh_against_case(
    brief: AnalysisCaseBrief,
    metrics: MetricSet,
    *,
    method_id: str,
) -> CaseMeshReview:
    results: list[dict] = []
    meets = 0
    misses = 0
    incomplete = 0
    for target in brief.quality_targets:
        row = _eval_target(target, metrics)
        results.append(row)
        st = row["status"]
        if st == "MEETS":
            meets += 1
        elif st == "MISSES":
            misses += 1
        else:
            incomplete += 1

    if incomplete and not meets and not misses:
        overall = "INCOMPLETE"
    elif misses and meets:
        overall = "MIXED"
    elif misses:
        overall = "MISSES_TARGETS"
    else:
        overall = "MEETS_DEMO_TARGETS"

    narrative = (
        f"Case '{brief.title}' method '{method_id}': {overall}. "
        f"{meets} targets met, {misses} missed, {incomplete} incomplete. "
        "These are DEMO geometric targets — not solver convergence."
    )
    return CaseMeshReview(
        brief_title=brief.title,
        method_id=method_id,
        target_results=results,
        narrative=narrative,
        overall=overall,  # type: ignore[arg-type]
    )


def _eval_target(target: QualityTarget, metrics: MetricSet) -> dict:
    mv = metrics.get(target.metric)
    if mv is None:
        return {
            "metric": target.metric,
            "status": "INCOMPLETE",
            "observed": None,
            "threshold": target.threshold,
            "why": target.why,
        }
    if mv.units != target.units:
        return {
            "metric": target.metric,
            "status": "INCOMPLETE",
            "observed": mv.value,
            "threshold": target.threshold,
            "why": f"Unit mismatch ({mv.units} vs {target.units}). {target.why}",
        }
    ok = _OPS[target.op](mv.value, target.threshold)
    return {
        "metric": target.metric,
        "status": "MEETS" if ok else "MISSES",
        "observed": mv.value,
        "threshold": target.threshold,
        "op": target.op,
        "why": target.why,
    }
