"""Qt / OpenGL bootstrap for the 3D workstation.

Windows has no DISPLAY env var. Never treat that as headless — that was forcing
QT_QPA_PLATFORM=offscreen and breaking QOpenGLWidget / PyVistaQt.
"""

from __future__ import annotations

import os
import sys


def is_linux_headless() -> bool:
    if not sys.platform.startswith("linux"):
        return False
    return not (os.environ.get("DISPLAY") or os.environ.get("WAYLAND_DISPLAY"))


def configure_qt_platform() -> str:
    """
    Set QT platform only when truly headless Linux (CI).

    Returns the effective mode: 'windows' | 'interactive' | 'linux-headless'.
    """
    if is_linux_headless():
        os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")
        return "linux-headless"

    # Do NOT force offscreen on Windows/macOS (no DISPLAY there by design).
    # If a previous broken run exported offscreen, clear it on interactive OS.
    if sys.platform.startswith("win") or sys.platform == "darwin":
        if os.environ.get("QT_QPA_PLATFORM", "").lower() == "offscreen":
            del os.environ["QT_QPA_PLATFORM"]
        os.environ.setdefault("QT_OPENGL", "desktop")
        return "windows" if sys.platform.startswith("win") else "interactive"

    return "interactive"


def apply_qt_opengl_attributes() -> None:
    """Call before QApplication() is constructed."""
    from PySide6.QtCore import Qt
    from PySide6.QtWidgets import QApplication

    QApplication.setAttribute(Qt.AA_ShareOpenGLContexts, True)
    if sys.platform.startswith("win"):
        # Prefer desktop OpenGL over ANGLE/software for VTK/QOpenGLWidget
        try:
            QApplication.setAttribute(Qt.AA_UseDesktopOpenGL, True)
        except Exception:
            pass


def configure_pyvista_interactive() -> None:
    import pyvista as pv

    pv.OFF_SCREEN = False
    # Avoid grabbing a broken global theme on first import in some Windows envs
    try:
        pv.global_theme.allow_empty_mesh = True
    except Exception:
        pass


def bootstrap_desktop_gl() -> str:
    """Full pre-QApplication GL/platform bootstrap. Returns platform mode."""
    mode = configure_qt_platform()
    if mode != "linux-headless":
        configure_pyvista_interactive()
    return mode
