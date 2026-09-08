#!/usr/bin/env python3
"""
PPT Master - Export Work Directory Tests

Verify writable assembly directories and platform permission behavior.

Usage:
    python3 skills/ppt-master/scripts/tests/test_export_work_directory.py

Examples:
    python3 skills/ppt-master/scripts/tests/test_export_work_directory.py

Dependencies:
    Standard library and PPT Master runtime dependencies.
"""

import ctypes
import os
import stat
import sys
import tempfile
import unittest
from pathlib import Path

_SCRIPTS_DIR = Path(__file__).resolve().parents[1]
if str(_SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS_DIR))

from console_encoding import configure_utf8_stdio  # noqa: E402
from svg_to_pptx.pptx_package.builder import _create_writable_work_dir  # noqa: E402


class ExportWorkDirectoryTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.output = Path(self.temporary.name) / 'exports' / 'deck.pptx'

    def test_directories_are_writable_unique_and_probe_free(self) -> None:
        first = _create_writable_work_dir(self.output)
        second = _create_writable_work_dir(self.output)
        self.assertNotEqual(first, second)
        for directory in (first, second):
            self.assertEqual(directory.parent, self.output.parent)
            self.assertEqual(list(directory.iterdir()), [])
            payload = directory / 'slide.xml'
            payload.write_text('<slide/>', encoding='utf-8')
            self.assertEqual(payload.read_text(encoding='utf-8'), '<slide/>')

    @unittest.skipUnless(os.name == 'posix', 'POSIX permission modes')
    def test_posix_directory_remains_private(self) -> None:
        directory = _create_writable_work_dir(self.output)
        self.assertEqual(stat.S_IMODE(directory.stat().st_mode), 0o700)

    @unittest.skipUnless(os.name == 'nt', 'Windows DACL inheritance')
    def test_windows_directory_does_not_protect_its_dacl(self) -> None:
        directory = _create_writable_work_dir(self.output)
        advapi = ctypes.WinDLL('advapi32', use_last_error=True)
        kernel = ctypes.WinDLL('kernel32', use_last_error=True)
        get_security = advapi.GetNamedSecurityInfoW
        get_security.argtypes = [ctypes.c_wchar_p, ctypes.c_uint32, ctypes.c_uint32,
                                 ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p,
                                 ctypes.c_void_p, ctypes.POINTER(ctypes.c_void_p)]
        get_security.restype = ctypes.c_uint32
        get_control = advapi.GetSecurityDescriptorControl
        get_control.argtypes = [ctypes.c_void_p, ctypes.POINTER(ctypes.c_uint16),
                                ctypes.POINTER(ctypes.c_uint32)]
        get_control.restype = ctypes.c_int
        kernel.LocalFree.argtypes = [ctypes.c_void_p]
        kernel.LocalFree.restype = ctypes.c_void_p
        descriptor = ctypes.c_void_p()
        # SE_FILE_OBJECT and DACL_SECURITY_INFORMATION return the actual DACL.
        result = get_security(str(directory), 1, 4, None, None, None, None,
                              ctypes.byref(descriptor))
        self.assertEqual(result, 0)
        try:
            control = ctypes.c_uint16()
            revision = ctypes.c_uint32()
            self.assertTrue(get_control(descriptor, ctypes.byref(control),
                                        ctypes.byref(revision)))
            self.assertFalse(control.value & 0x1000, 'DACL inheritance is protected')
        finally:
            kernel.LocalFree(descriptor)


if __name__ == '__main__':
    configure_utf8_stdio()
    unittest.main()
