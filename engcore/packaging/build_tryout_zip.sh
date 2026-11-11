#!/usr/bin/env bash
# Lightweight source tryout zip (Python required on the host).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/packaging/releases"
STAGE="$OUT_DIR/_stage_tryout"
NAME="ENGINEERING_CORE_tryout"

rm -rf "$STAGE"
mkdir -p "$STAGE/$NAME/src"

# Package metadata + launcher
cp "$ROOT/pyproject.toml" "$STAGE/$NAME/"
cp "$ROOT/README.md" "$STAGE/$NAME/"
cp "$ROOT/packaging/Run_ENGINEERING_CORE.bat" "$STAGE/$NAME/"
cp -a "$ROOT/src/engcore" "$STAGE/$NAME/src/"
# Drop caches
find "$STAGE/$NAME" -type d -name '__pycache__' -exec rm -rf {} + 2>/dev/null || true
find "$STAGE/$NAME" -type f -name '*.pyc' -delete 2>/dev/null || true

cat > "$STAGE/$NAME/HOW_TO_RUN.txt" <<'EOF'
ENGINEERING//CORE — source tryout

1. Install Python 3.11+
2. Double-click Run_ENGINEERING_CORE.bat  (or: python -m pip install -e ".[desktop]" && python -m engcore.desktop)
3. UI: STEP seç → analiz tipi → Analiz et → Mesh üret → dışa aktar
4. Real STEP/STP needs Gmsh (included in .[desktop])

Output: ~/ENGINEERING_CORE_runs/run_*/mesh_export/  (mesh.json, mesh.vtu/vtk, mesh_surface.stl)
EOF

(
  cd "$STAGE"
  rm -f "$OUT_DIR/${NAME}.zip"
  zip -r -q "$OUT_DIR/${NAME}.zip" "$NAME"
)
rm -rf "$STAGE"
ls -lh "$OUT_DIR/${NAME}.zip"
echo "TRYOUT_ZIP=$OUT_DIR/${NAME}.zip"
