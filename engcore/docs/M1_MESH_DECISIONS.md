# M1 — Viewer + engineering mesh decisions

## Engineering boundary
STEP alone cannot choose a correct mesh. The same cylinder needs different strategies for static tension, buckling, crash, and thermal analysis. Users must provide:

- analysis type
- target solver
- optional critical regions / contact / thin-wall flags

The software automates **the rest**: sizing proposals, local refine hints, tet generation, quality metrics, and side-by-side comparison.

## M1 user flow
1. Load STEP/fixture → see geometry in 3D viewer (surface preview; mesh overlay after meshing)
2. Set analysis context (required)
3. Select regions (CAD faces / fixture faces / bbox fallback)
4. **Interpret case** → physics drivers, missing inputs, feature length, method plan
5. Get recommended strategy + alternatives from that method plan
6. Mesh one strategy **or** compare several; review against DEMO quality targets
7. Export reports per variant

## Case interpretation (`engcore interpret`)
Produces an `AnalysisCaseBrief`:
- physics + mesh drivers
- missing STEP-impossible inputs (BCs, material, …)
- feature length (e.g. hole) → local size (~N elems across)
- through-thickness element policy for thin solids
- DEMO geometric quality targets + post-mesh review

## Automation map (first product)

User supplies **analysis type / solver / flags**. Software automates the rest
(`engcore.orchestration.automation.run_mesh_automation`):

1. Detect features (holes / thin-wall)
2. Select critical faces (or keep user selection)
3. Recommend size (Autodesk / ICEMM / MSC / NAFEMS — `docs/MESH_SIZING.md`)
4. Generate TRI3 (selected faces) or TET4 (volume + local refine)
5. Export mesh package

Desktop: **Otomatik çalıştır** button + step progress rail (Workbench-like status).

| Capability | M1 status |
|------------|-----------|
| STEP load + view (CAD only, no auto mesh) | Yes |
| Feature tree hide/show/delete | Yes |
| Region selection | Yes (CAD / fixture / bbox) |
| One-click preprocess automation | Yes |
| Strategy / size recommendation | Yes (DEMO + cited practice) |
| Feature hints (holes/thin-wall) | Yes (DEMO) |
| Surface TRI3 on selected faces | Yes |
| Volume TET4 + quality | Yes |
| Hex/sweep/multizone | Out of scope |
| Solver convergence check | Out of scope |
| Classified fillet/chamfer recognition | Next |

## Desktop
```bash
pip install -e ".[desktop]"
python -m engcore.desktop
```
