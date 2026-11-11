# Mesh sizing guidance (DEMO — cited industry practice)

ENGINEERING//CORE does **not** invent mesh sizes arbitrarily. Recommended sizes follow
widely published FEA practice. Citations below. Always confirm with mesh convergence
for the quantity of interest (stress, eigenvalue, etc.).

## Sources

1. **Autodesk Fusion — Mesh quality**  
   https://help.autodesk.com/cloudhelp/ENU/Fusion-Simulate/files/SIM-MESH-QUALITY.htm  
   - Bending / stress reversal through thickness: **≥ 4 linear** or **≥ 2 parabolic**
     elements through thickness.  
   - Membrane-dominated thin walls: **1 linear** element through thickness may suffice.  
   - Prefer local refinement over extreme global density.  
   - Aspect ratio ideally ~1; avoid >10 in critical regions.

2. **ICEMM — Mesh size definition in structural analysis**  
   https://www.icemm.com/en/fem-02-finite-element-modelling-mesh-size-definition-in-structural-analysis/  
   - 3D solids from plates: 4 linear / 2–3 quadratic through thickness.  
   - Keep mesh transitions away from the study area.

3. **MSC Nastran / Simulating Reality — Mesh density**  
   https://simulatemore.mscsoftware.com/the-best-fea-mesh-density-for-accuracy-and-speed-msc-nastran/  
   - Finest spacing where stress gradients are steepest (e.g. hole edge).  
   - Biasing toward a hole improves Kt capture vs uniform coarse mesh.

4. **NAFEMS** linear benchmarks (plate-with-hole Kt) — mesh must resolve the
   concentration; convergence of the QoI is the acceptance criterion, not a fixed
   element count alone.

## ENGINEERING//CORE encoding (DEMO)

| Driver | Policy |
|--------|--------|
| Global size | `L_char / 8` default (static); tighter for crash |
| Local face size | `min(global, feature_len / N)` with N≈12 around holes |
| Through-thickness | `t / 4` (linear TET) when bending / thin-wall flagged |
| Surface TRI3 | user size on selected faces only |
| Volume TET4 | global + optional local size on selected CAD faces |

Disclaimer: Geometric mesh creation ≠ solver validation.
