#!/usr/bin/env bash
# Full source tryout zip (Python required). Mirrors engcore/ minus build caches.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/packaging/releases"
STAGE="$OUT_DIR/_stage_tryout"
NAME="ENGINEERING_CORE_tryout"

rm -rf "$STAGE"
mkdir -p "$STAGE/$NAME"

# Full engcore checkout via tar filter (no rsync dependency)
tar -C "$ROOT" \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  --exclude='.pytest_cache' \
  --exclude='*.egg-info' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='.ruff_cache' \
  --exclude='packaging/releases' \
  -cf - . | tar -C "$STAGE/$NAME" -xf -

# Root launcher for the zip (cwd = package root, not packaging/)
cat > "$STAGE/$NAME/Run_ENGINEERING_CORE.bat" <<'EOF'
@echo off
cd /d "%~dp0"
REM Windows: never use offscreen Qt — that breaks the 3D viewer backbone.
set QT_OPENGL=desktop
if /I "%QT_QPA_PLATFORM%"=="offscreen" set QT_QPA_PLATFORM=
echo Installing ENGINEERING//CORE desktop (3D + Gmsh for STEP)...
python -m pip install -e ".[desktop]"
if errorlevel 1 (
  echo pip failed. Is Python 3.11+ on PATH?
  pause
  exit /b 1
)
echo Launching: STEP -^> analysis -^> mesh -^> export...
python -m engcore.desktop
if errorlevel 1 pause
EOF

cat > "$STAGE/$NAME/HOW_TO_RUN.txt" <<'EOF'
ENGINEERING//CORE — full source tryout

Contents: complete engcore/ tree (src, docs, tests, scripts, packaging helpers).

1. Install Python 3.11+
2. Double-click Run_ENGINEERING_CORE.bat
   or:  python -m pip install -e ".[desktop]" && python -m engcore.desktop
3. UI: STEP seç → analiz tipi → Analiz et → Mesh üret → dışa aktar
4. Real STEP/STP needs Gmsh (included in .[desktop])

Output: ~/ENGINEERING_CORE_runs/run_*/mesh_export/
EOF

# Manifest so downloaders can verify completeness
(
  cd "$STAGE/$NAME"
  find . -type f ! -path './FILE_MANIFEST.txt' | sed 's|^\./||' | sort
) > "$STAGE/$NAME/FILE_MANIFEST.txt"

FILE_COUNT=$(wc -l < "$STAGE/$NAME/FILE_MANIFEST.txt")
BYTE_COUNT=$(du -sb "$STAGE/$NAME" | awk '{print $1}')

(
  cd "$STAGE"
  rm -f "$OUT_DIR/${NAME}.zip"
  zip -r -q "$OUT_DIR/${NAME}.zip" "$NAME"
)
rm -rf "$STAGE"

ls -lh "$OUT_DIR/${NAME}.zip"
echo "TRYOUT_ZIP=$OUT_DIR/${NAME}.zip"
echo "TRYOUT_FILES=$FILE_COUNT"
echo "TRYOUT_BYTES=$BYTE_COUNT"

# Sanity: critical paths must exist inside the zip
for must in \
  "src/engcore/desktop/mainwindow.py" \
  "src/engcore/reporting/mesh_export.py" \
  "src/engcore/geometry/gmsh_occ.py" \
  "docs/DESKTOP_PACKAGE.md" \
  "tests/reporting/test_mesh_export.py" \
  "AGENTS.md" \
  "pyproject.toml" \
  "Run_ENGINEERING_CORE.bat" \
  "FILE_MANIFEST.txt"
do
  unzip -Z1 "$OUT_DIR/${NAME}.zip" | grep -qx "ENGINEERING_CORE_tryout/${must}" \
    || { echo "MISSING IN ZIP: $must"; exit 1; }
done
echo "SANITY_OK=1"
