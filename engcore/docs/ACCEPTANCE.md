# Acceptance — ENGINEERING//CORE M0

## Gate 0
- [x] Repo tree under `engcore/`
- [x] Pinned `pyproject.toml` dependencies
- [x] Licensing / data-security ADR
- [x] Synthetic STEP fixture(s)
- [x] Agent + model matrix docs present

## Gate 1
- [x] Domain models and ports typed and tested
- [x] No vendor types in domain package
- [x] Unit policy and provenance fields present

## Vertical slice
- [x] CLI: fixture STEP → report JSON exit 0
- [x] Metrics named and unit-bearing
- [x] Rules produce explainable DEMO decisions (never silent PASS on invalid)
- [x] Mesh artifact exported

## Desktop + CI
- [x] Desktop entry can run pipeline against fixture and show summary
- [x] Integration test covers end-to-end path
- [x] CI workflow runs pytest

## Explicit non-claims
Mesh quality PASS does **not** imply solver readiness or engineering validation.
