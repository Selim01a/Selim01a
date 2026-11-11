#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-/tmp/engcore-smoke}"
cd "$ROOT"
python -m pip install -e ".[dev]" -q
engcore run --fixture unit-cube --confirm-units --units m --out "$OUT"
test -f "$OUT/quality_report.json"
test -f "$OUT/mesh.json"
echo "SMOKE OK: $OUT"
