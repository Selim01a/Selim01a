from __future__ import annotations

import os
import sys

from engcore.desktop.gl_bootstrap import (
    configure_qt_platform,
    is_linux_headless,
)


def test_windows_does_not_force_offscreen(monkeypatch) -> None:
    monkeypatch.setattr(sys, "platform", "win32")
    monkeypatch.delenv("DISPLAY", raising=False)
    monkeypatch.delenv("WAYLAND_DISPLAY", raising=False)
    monkeypatch.setenv("QT_QPA_PLATFORM", "offscreen")  # poisoned by old bug
    mode = configure_qt_platform()
    assert mode == "windows"
    assert os.environ.get("QT_QPA_PLATFORM") != "offscreen"
    assert os.environ.get("QT_OPENGL") == "desktop"


def test_linux_headless_sets_offscreen(monkeypatch) -> None:
    monkeypatch.setattr(sys, "platform", "linux")
    monkeypatch.delenv("DISPLAY", raising=False)
    monkeypatch.delenv("WAYLAND_DISPLAY", raising=False)
    monkeypatch.delenv("QT_QPA_PLATFORM", raising=False)
    assert is_linux_headless() is True
    mode = configure_qt_platform()
    assert mode == "linux-headless"
    assert os.environ.get("QT_QPA_PLATFORM") == "offscreen"


def test_linux_with_display_stays_interactive(monkeypatch) -> None:
    monkeypatch.setattr(sys, "platform", "linux")
    monkeypatch.setenv("DISPLAY", ":0")
    monkeypatch.delenv("QT_QPA_PLATFORM", raising=False)
    assert is_linux_headless() is False
    mode = configure_qt_platform()
    assert mode == "interactive"
    assert os.environ.get("QT_QPA_PLATFORM") != "offscreen"


def test_darwin_clears_offscreen(monkeypatch) -> None:
    monkeypatch.setattr(sys, "platform", "darwin")
    monkeypatch.delenv("DISPLAY", raising=False)
    monkeypatch.setenv("QT_QPA_PLATFORM", "offscreen")
    mode = configure_qt_platform()
    assert mode == "interactive"
    assert os.environ.get("QT_QPA_PLATFORM") != "offscreen"
