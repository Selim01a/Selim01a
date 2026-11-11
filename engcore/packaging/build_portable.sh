#!/usr/bin/env bash
# Build a downloadable portable folder + zip for the current platform.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="${1:-$ROOT/dist}"
STAMP="$(date -u +%Y%m%d)"
NAME="ENGINEERING_CORE_M0_${STAMP}_$(uname -s)_$(uname -m)"
OUT="$DIST/$NAME"

cd "$ROOT"
python3 -m pip install -e ".[dev]" -q
python3 -m pip install -q pyinstaller

rm -rf "$OUT" "$DIST/ENGINEERING_CORE" "$DIST/ENGINEERING_CORE_portable"
mkdir -p "$DIST"

# 1) Onedir PyInstaller build (desktop)
export PATH="$HOME/.local/bin:$PATH"
pyinstaller --noconfirm --clean packaging/engcore_desktop.spec --distpath "$DIST" --workpath "$DIST/build"

# 2) Assemble portable bundle with README + fixtures + CLI helper
mkdir -p "$OUT"
cp -a "$DIST/ENGINEERING_CORE/." "$OUT/"
cp "$ROOT/README.md" "$OUT/README.md"
cp "$ROOT/docs/GATE_REPORT_M0.md" "$OUT/GATE_REPORT.md"
cat > "$OUT/HOW_TO_RUN.txt" <<'EOF'
ENGINEERING//CORE M0 — portable desktop

Windows (when built on Windows):
  Double-click ENGINEERING_CORE.exe

Linux:
  ./ENGINEERING_CORE

Then:
  1. Click "Demo fixture"
  2. Confirm units (m)
  3. Run pipeline
  4. Open report folder

Headless CLI (from a Python source install):
  engcore run --fixture unit-cube --confirm-units --units m --out ./out

Note: Geometric PASS does not mean solver readiness.
EOF

# CLI companion script for source-style runs inside the zip is not needed for frozen;
# add a small batch/shell note only.

(
  cd "$DIST"
  zip -r -q "${NAME}.zip" "$NAME"
)
echo "PORTABLE_DIR=$OUT"
echo "PORTABLE_ZIP=$DIST/${NAME}.zip"
ls -lh "$DIST/${NAME}.zip"
