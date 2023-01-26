#!/usr/bin/env python3

# from _test_cffi import ffi, lib
# print(lib.test("hello world"))

from ctypes import cdll, c_char_p
lib = cdll.LoadLibrary("libtest.so")
print(lib)


str = c_char_p(b"hello")
print(lib.test(str))
print(lib.test(b"hello world"))