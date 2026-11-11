from __future__ import annotations

from engcore.domain.models import MetricSet, MetricValue, RuleStatus
from engcore.standards.engine import SafeRuleEngine


def test_rules_pass_on_healthy_metrics() -> None:
    metrics = MetricSet(
        mesh_ref="m1",
        metrics=(
            MetricValue("min_tet_volume", 1e-6, "m^3"),
            MetricValue("max_aspect_ratio", 3.0, "1"),
            MetricValue("positive_volume_fraction", 1.0, "1"),
            MetricValue("n_elements", 12.0, "1"),
        ),
    )
    decisions = SafeRuleEngine().evaluate(metrics)
    assert decisions
    assert all(d.status == RuleStatus.PASS for d in decisions)
    assert all(d.maturity == "DEMO" for d in decisions)


def test_missing_metric_is_not_pass() -> None:
    metrics = MetricSet(mesh_ref="m1", metrics=())
    decisions = SafeRuleEngine().evaluate(metrics)
    assert all(d.status == RuleStatus.NOT_APPLICABLE for d in decisions)
