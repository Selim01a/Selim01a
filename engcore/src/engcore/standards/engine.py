"""Safe rule evaluator — comparison ops only, never eval/exec."""

from __future__ import annotations

from engcore.domain.models import MetricSet, RuleDecision, RuleStatus
from engcore.standards.rulebook import DEFAULT_DEMO_RULEBOOK, RuleSpec


_OPS = {
    "gt": lambda a, b: a > b,
    "ge": lambda a, b: a >= b,
    "lt": lambda a, b: a < b,
    "le": lambda a, b: a <= b,
}


class SafeRuleEngine:
    def __init__(self, rules: tuple[RuleSpec, ...] | None = None) -> None:
        self._rules = rules or DEFAULT_DEMO_RULEBOOK

    def evaluate(self, metrics: MetricSet) -> list[RuleDecision]:
        decisions: list[RuleDecision] = []
        for rule in self._rules:
            mv = metrics.get(rule.metric)
            if mv is None:
                decisions.append(
                    RuleDecision(
                        rule_id=rule.rule_id,
                        version=rule.version,
                        metric=rule.metric,
                        observed=None,
                        threshold=rule.threshold,
                        units=rule.units,
                        status=RuleStatus.NOT_APPLICABLE,
                        evidence=f"Metric '{rule.metric}' missing; rule not applicable.",
                        maturity=rule.maturity,
                    )
                )
                continue
            if mv.units != rule.units:
                decisions.append(
                    RuleDecision(
                        rule_id=rule.rule_id,
                        version=rule.version,
                        metric=rule.metric,
                        observed=mv.value,
                        threshold=rule.threshold,
                        units=rule.units,
                        status=RuleStatus.ERROR,
                        evidence=(
                            f"Unit mismatch: metric units '{mv.units}' vs rule '{rule.units}'."
                        ),
                        maturity=rule.maturity,
                    )
                )
                continue
            op = _OPS[rule.op]
            passed = op(mv.value, rule.threshold)
            decisions.append(
                RuleDecision(
                    rule_id=rule.rule_id,
                    version=rule.version,
                    metric=rule.metric,
                    observed=mv.value,
                    threshold=rule.threshold,
                    units=rule.units,
                    status=RuleStatus.PASS if passed else RuleStatus.FAIL,
                    evidence=(
                        f"{rule.description} Observed {mv.value} {mv.units}; "
                        f"require {rule.op} {rule.threshold}."
                    ),
                    maturity=rule.maturity,
                )
            )
        return decisions
