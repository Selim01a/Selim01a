# -*- mode: python ; coding: utf-8 -*-
from pathlib import Path

block_cipher = None
root = Path(SPECPATH).resolve().parent
src = root / "src"
fixtures = src / "engcore" / "data" / "fixtures"

a = Analysis(
    [str(src / "engcore" / "desktop" / "__main__.py")],
    pathex=[str(src)],
    binaries=[],
    datas=[(str(fixtures), "engcore/data/fixtures")],
    hiddenimports=[
        "engcore",
        "engcore.cli",
        "engcore.desktop.app",
        "engcore.orchestration.pipeline",
        "engcore.geometry.synthetic",
        "engcore.meshing.synthetic",
        "engcore.quality.metrics",
        "engcore.standards.engine",
        "engcore.reporting.exporter",
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="ENGINEERING_CORE",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=False,
    disable_windowed_traceback=False,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name="ENGINEERING_CORE",
)
