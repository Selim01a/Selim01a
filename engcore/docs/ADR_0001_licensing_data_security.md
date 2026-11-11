# ADR 0001 — Licensing and data security (M0)

## Status
Accepted

## Context
ENGINEERING//CORE processes proprietary STEP geometry. Users require offline-first behavior and must not accidentally leak CAD to external services.

## Decision
1. Core pipeline runs fully offline; no network calls for import/mesh/quality/report.
2. Bundled dependencies are OSS with permissive or LGPL-compatible licenses suitable for local desktop use (Python stdlib + optional `gmsh` local install).
3. Synthetic fixtures are project-owned and redistributable; customer STEP files stay local.
4. Agents must not upload customer STEP/models to cloud providers without explicit user approval.
5. Run artifacts record SHA-256 provenance of inputs for auditability.
6. Optional Gmsh backend is local-process only.

## Consequences
- CI uses synthetic adapters so runners need not install Gmsh.
- Desktop/CLI warn when unit confirmation is missing.
- Future cloud features require a new ADR and explicit opt-in.
