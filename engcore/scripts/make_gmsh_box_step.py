#!/usr/bin/env python3
"""Write a real OCC/Gmsh unit-box STEP for face-topology demos."""

from __future__ import annotations

from pathlib import Path


def main() -> None:
    import gmsh

    out = Path(__file__).resolve().parents[1] / "src" / "engcore" / "data" / "fixtures" / "box_occ.step"
    gmsh.initialize()
    try:
        gmsh.option.setNumber("General.Terminal", 0)
        gmsh.model.add("box")
        gmsh.model.occ.addBox(0, 0, 0, 1, 1, 1)
        gmsh.model.occ.synchronize()
        gmsh.write(str(out))
        print(f"wrote {out}")
    finally:
        gmsh.finalize()


if __name__ == "__main__":
    main()
