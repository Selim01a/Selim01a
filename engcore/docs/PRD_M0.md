# PRD — ENGINEERING//CORE M0

## Product
Windows-first, offline-first, solver-independent structural-engineering workstation for mesh preparation and geometric quality gating of a single closed-solid STEP model.

## M0 user journey
1. Load one closed-solid STEP file (or use bundled synthetic fixture).
2. Confirm source units explicitly; convert to SI (metres) inside core.
3. Generate a 3D TET4 mesh via Gmsh/OpenCASCADE adapter (or deterministic synthetic adapter when Gmsh is unavailable).
4. Compute named mesh quality metrics.
5. Evaluate versioned DEMO/APPROVED rules with explainable decisions.
6. Export quality report + mesh artifact (JSON/VTK-lite).
7. Use either headless CLI or desktop UI for the same pipeline.

## Out of scope (M0)
- Solver execution / result validation
- AI vision / advanced feature recognition
- Multi-body contacts
- Hex auto-partitioning
- Claiming mesh quality implies solver accuracy

## Success
- Installable Python package `engcore`
- CLI smoke: synthetic STEP → quality report exits 0
- Desktop can trigger the same pipeline and show report summary
- Tests cover domain contracts, adapters, rules, and integration path
