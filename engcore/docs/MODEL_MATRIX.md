# ENGINEERING//CORE — Hybrid Agent / Model Matrix

Credit-preserving intelligence: expensive models are **not** permanent agent identities.
Each agent has a **default (cheap)** model; **escalate** only when rules fire.

## Model tiers (Cursor slug map)

| Tier | Model slug | Use |
|------|------------|-----|
| T0 cheap/fast | `grok-4.7-high-fast` or `gpt-5.6-sol-medium-fast` | Boilerplate, wiring, test scaffolds, CI, UI binding |
| T1 balanced | `gpt-5.6-sol-high` or `claude-fable-5-2-medium` | Gate planning, merge review, mid-difficulty implementation |
| T2 critical | `claude-opus-5-5-high` | Domain contracts, CAD/mesh adapter boundaries, rule safety, hard bugs |
| T3 rare max | `claude-opus-5-5-xhigh` / `claude-fable-5-2-high` | Gate blockers, architecture ADRs, freeze decisions — short sessions |

When GPT 6.x Sol becomes available, drop it into T0/T1 in place of `gpt-5.6-sol`.

## Agent defaults and escalate targets

| Agent | Default (credit-friendly) | Escalate when / to |
|-------|---------------------------|--------------------|
| **00 Orchestrator** | Fable **medium** (short gate plan + merge) | Gate break / ADR / scope fight → Fable **high** (short). Routine merge checklist → GPT Sol medium-fast |
| **01 Domain** | GPT Sol **high** first draft | Schema freeze, port design, breaking change → **Opus 5.5 high** |
| **02 Geometry** | Grok **high** implementation | OCC/STEP units, topology identity, adapter leak → **Opus** |
| **03 Meshing** | Grok **high** | TET4 quality path, Gmsh boundary bug → **Opus** |
| **04 Standards** | GPT Sol **high** | Safe expression engine, DEMO/APPROVED semantics → **Opus** |
| **05 Quality/Report** | Grok **fast** | Metric formula / threshold debate → GPT Sol high |
| **06 Desktop** | Grok **fast** | UX/state edge case → GPT Sol medium |
| **07 Integration/CI** | Grok **fast** | Flaky gate / packaging → GPT Sol high |

Core idea: **Opus/Fable credits are for decisions that would kill M0 if wrong — not for every line of code.**

## Escalate rules (credit brake)

Escalate **only** when:
1. Domain contract / public schema change
2. Vendor type leak (Gmsh/OCC crossing into domain)
3. Unit / topology identity ambiguity
4. Rule-engine safety (`eval` risk, false PASS)
5. Same bug fails twice on a T0 agent
6. Gate acceptance red and root cause unclear

Do **not** escalate for:
- Import/export wiring, pytest scaffolds, CI yaml, UI layout, doc fill-in
- Cosmetic refactors on a green path

**Budget discipline:** at most 1–2 Opus sessions per gate; Fable high only for gate reports/ADRs. Daily volume stays on Grok/GPT-fast.
