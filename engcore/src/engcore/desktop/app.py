"""Desktop entry — 3D viewer is mandatory (PySide6 + PyVista + PyVistaQt)."""

from __future__ import annotations


def main() -> None:
    try:
        import PySide6  # noqa: F401
        import pyvista  # noqa: F401
        import pyvistaqt  # noqa: F401
    except ImportError as exc:
        raise SystemExit(
            "ENGINEERING//CORE desktop requires the 3D stack.\n"
            "Install with:\n"
            '  python -m pip install -e ".[desktop]"\n'
            f"Missing import: {exc}"
        ) from exc

    from engcore.desktop.mainwindow import run_desktop

    raise SystemExit(run_desktop())


if __name__ == "__main__":
    main()
