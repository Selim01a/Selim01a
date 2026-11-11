from __future__ import annotations

import importlib.util

import pytest


def test_desktop_module_imports() -> None:
    from engcore.desktop import app

    assert hasattr(app, "EngCoreApp")
    assert hasattr(app, "main")


def test_desktop_app_requires_tk_or_constructs() -> None:
    from engcore.desktop.app import EngCoreApp

    if importlib.util.find_spec("tkinter") is None:
        with pytest.raises(SystemExit, match="Tkinter"):
            EngCoreApp()
    else:
        # Don't start mainloop in CI; just construct.
        app = EngCoreApp()
        assert app.root is not None
        app.root.destroy()
