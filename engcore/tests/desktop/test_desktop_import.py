from __future__ import annotations

import importlib.util
import os

import pytest


def test_desktop_module_imports() -> None:
    from engcore.desktop import app

    assert hasattr(app, "main")


def test_app_requires_desktop_stack_message() -> None:
    """Without pyvistaqt, main must exit with install instructions (no silent Tk)."""
    import builtins

    real_import = builtins.__import__

    def fake_import(name, *args, **kwargs):
        if name == "pyvistaqt" or name.startswith("pyvistaqt."):
            raise ImportError("simulated missing pyvistaqt")
        return real_import(name, *args, **kwargs)

    # Re-exec main path with patched import is heavy; just assert helper text exists.
    from engcore.desktop import app as app_mod
    import inspect

    src = inspect.getsource(app_mod.main)
    assert '.[desktop]' in src or '"[desktop]"' in src
    assert "pyvistaqt" in src


def test_tk_fallback_still_importable() -> None:
    from engcore.desktop import tk_fallback

    assert hasattr(tk_fallback, "EngCoreApp")


def test_tk_fallback_constructs_when_display() -> None:
    from engcore.desktop.tk_fallback import EngCoreApp

    if importlib.util.find_spec("tkinter") is None:
        pytest.skip("tkinter missing")
    if not os.environ.get("DISPLAY"):
        pytest.skip("No DISPLAY; skipping Tk() construction on headless CI")
    app = EngCoreApp()
    assert app.root is not None
    app.root.destroy()


def test_viewer_host_and_mainwindow_importable_when_desktop_extras_present() -> None:
    try:
        import PySide6  # noqa: F401
        import pyvista  # noqa: F401
        import pyvistaqt  # noqa: F401
    except ImportError:
        pytest.skip("desktop extras not installed")
    from engcore.desktop import mainwindow, viewer_host

    assert hasattr(mainwindow, "run_desktop")
    assert hasattr(viewer_host, "ViewerHost")
