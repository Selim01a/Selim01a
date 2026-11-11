# ENGINEERING//CORE: Global agent rules

**Source of truth:** `docs/PRD_M0.md`, `docs/CONTRACTS.md`, `docs/ACCEPTANCE.md`, `docs/MODEL_MATRIX.md`, and approved ADRs. Agent 01 maintains model definitions; Agent 00 controls integration.

1. Work offline-first, with deterministic inputs/configuration and auditable outputs. NEVER upload user's company STEP models or other proprietary materials to external services without approval.
2. Do not modify another agent's owned source folder. Cross-cutting changes require Agent 00 approval. Avoid parallel edits to `pyproject.toml`, lockfiles, and shared schemas.
3. No vendor-specific data types may cross a core domain interface. Gmsh entity tags, VTK objects, or raw OCC handles stay inside adapters.
4. One canonical unit policy: SI inside core. STEP source units must be verified and converted at the import boundary; if units cannot be trusted, request user confirmation. Display may use mm.
5. Treat geometry reference identity and CAD topology tags as separate: Gmsh/OCC tags are NOT durable persistent identifiers across remeshing or CAD revision.
6. Every error should be actionable. Missing or invalid closed solids, incompatible meshes, and non-applicable rules must never be reported as PASS.
7. Every feature requires tests, typed interfaces, structured logs, and an example of expected input/output.
8. Rule decisions are explainable: rule id, version, metric, observed value, threshold, units, evaluation status, and evidence. Distinguish DEMO from APPROVED rules.
9. Do not claim mesh convergence, solver readiness, or validated engineering suitability based solely on geometric mesh quality.
10. Each agent handoff includes: modified files, public interfaces, test commands/results, known limitations, unresolved issues, and commit/branch reference.
11. No unapproved scope expansion. No solver-run execution, AI vision, advanced feature recognition, multi-body contacts, hex auto-partitioning in M0.
12. Prefer a functioning end-to-end path to disconnected beautiful modules. Agent 00 integrates at each gate, with smoke tests.
13. Follow `docs/MODEL_MATRIX.md`: use default (cheap) models for volume work; escalate to Opus/Fable high only when escalate rules fire. Do not burn premium credits on boilerplate.

## Folder ownership
- Agent 00: `src/engcore/orchestration/`, integration decisions, `docs/ADR_*`, integration merges.
- Agent 01: `src/engcore/domain/`, published schemas and ports.
- Agent 02: `src/engcore/geometry/`, `tests/geometry/`.
- Agent 03: `src/engcore/meshing/`, `tests/meshing/`.
- Agent 04: `src/engcore/standards/`, `tests/standards/`.
- Agent 05: `src/engcore/quality/`, `src/engcore/reporting/`, `tests/quality/`.
- Agent 06: `src/engcore/desktop/`, `tests/desktop/`.
- Agent 07: `tests/integration/`, `tests/fixtures/`, `scripts/`, release/CI files.
- Agent 00 manages `src/engcore/cli.py`, `pyproject.toml`, overall config and merges to prevent contention.

## Pull request requirements
- Scope and ticket, screenshots if UI, tests, documented output, known limitations, no fabricated quality metrics, no green status when a check was not run.
