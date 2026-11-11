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
| Capability | M1 status |
|------------|-----------|
| STEP load + view | Yes (surface preview; Gmsh tessellation when available) |
| Region selection | Yes (CAD faces via Gmsh/OCC, fixture faces, or bbox fallback) |
| Strategy recommendation from analysis context | Yes (DEMO heuristics) |
| Feature hints (holes/thin-wall) | Yes (DEMO — fixture metadata + bbox heuristics) |
| Tet mesh + quality | Yes |
| Compare mesh behaviours | Yes (table click switches 3D view) |
| Hex/sweep/multizone | Out of scope |
| Solver convergence check | Out of scope (needs solver) |
| Classified fillet/chamfer recognition | Next |

## Desktop
```bash
pip install -e ".[desktop]"
python -m engcore.desktop
```
