from __future__ import annotations

import importlib.util
import os

import pytest


def test_desktop_module_imports() -> None:
    from engcore.desktop import app

    assert hasattr(app, "main")


def test_tk_fallback_constructs_when_display() -> None:
    from engcore.desktop.tk_fallback import EngCoreApp

    if importlib.util.find_spec("tkinter") is None:
        pytest.skip("tkinter missing")
    if not os.environ.get("DISPLAY"):
        pytest.skip("No DISPLAY; skipping Tk() construction on headless CI")
    app = EngCoreApp()
    assert app.root is not None
    app.root.destroy()


def test_mainwindow_importable_when_desktop_extras_present() -> None:
    try:
        import PySide6  # noqa: F401
        import pyvista  # noqa: F401
    except ImportError:
        pytest.skip("desktop extras not installed")
    from engcore.desktop import mainwindow

    assert hasattr(mainwindow, "run_desktop")
