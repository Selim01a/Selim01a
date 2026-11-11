"""Desktop entry — prefer PySide6/PyVista workstation; Tk fallback."""

from __future__ import annotations


def main() -> None:
    try:
        import PySide6  # noqa: F401
        import pyvista  # noqa: F401
        from engcore.desktop.mainwindow import run_desktop

        raise SystemExit(run_desktop())
    except ImportError:
        from engcore.desktop.tk_fallback import main as tk_main

        tk_main()


if __name__ == "__main__":
    main()
