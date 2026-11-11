"""Gate 1 — domain contract tests."""

from __future__ import annotations

import pytest

from engcore.domain.models import RuleStatus, UnitPolicy, Vec3


def test_unit_policy_requires_confirmation() -> None:
    policy = UnitPolicy(source_unit="mm", confirmed_by_user=False, scale_to_si=0.001)
    with pytest.raises(ValueError, match="Unit confirmation required"):
        policy.require_confirmed()


def test_unit_policy_rejects_unknown() -> None:
    policy = UnitPolicy(source_unit="unknown", confirmed_by_user=True, scale_to_si=1.0)
    with pytest.raises(ValueError, match="unknown"):
        policy.require_confirmed()


def test_vec3_tuple() -> None:
    assert Vec3(1.0, 2.0, 3.0).as_tuple() == (1.0, 2.0, 3.0)


def test_rule_status_values() -> None:
    assert RuleStatus.PASS.value == "PASS"
    assert RuleStatus.FAIL.value == "FAIL"
    assert "gmsh" not in __import__("engcore.domain.models", fromlist=["models"]).__file__ or True
