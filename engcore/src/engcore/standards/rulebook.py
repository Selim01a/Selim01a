"""DEMO rulebook for M0. APPROVED rules require explicit promotion ADR."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal


@dataclass(frozen=True, slots=True)
class RuleSpec:
    rule_id: str
    version: str
    metric: str
    op: Literal["gt", "ge", "lt", "le"]
    threshold: float
    units: str
    maturity: Literal["DEMO", "APPROVED"]
    description: str


DEFAULT_DEMO_RULEBOOK: tuple[RuleSpec, ...] = (
    RuleSpec(
        rule_id="EC-Q-001",
        version="1.0.0",
        metric="min_tet_volume",
        op="gt",
        threshold=0.0,
        units="m^3",
        maturity="DEMO",
        description="All TET4 elements must have positive volume.",
    ),
    RuleSpec(
        rule_id="EC-Q-002",
        version="1.0.0",
        metric="max_aspect_ratio",
        op="le",
        threshold=50.0,
        units="1",
        maturity="DEMO",
        description="Maximum edge aspect ratio must stay within DEMO threshold.",
    ),
    RuleSpec(
        rule_id="EC-Q-003",
        version="1.0.0",
        metric="positive_volume_fraction",
        op="ge",
        threshold=0.5,
        units="1",
        maturity="DEMO",
        description="At least half of tets should have positive signed volume.",
    ),
    RuleSpec(
        rule_id="EC-Q-004",
        version="1.0.0",
        metric="n_elements",
        op="ge",
        threshold=1.0,
        units="1",
        maturity="DEMO",
        description="Mesh must contain at least one TET4 element.",
    ),
)
