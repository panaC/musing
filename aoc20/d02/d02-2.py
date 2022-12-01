#! /usr/local/bin/python3
import re
import sys

for line in sys.stdin:
    [(_min, _max, _char, _pass)] = re.findall("^(.*)-(.*) ([a-z]): (.*)$", line)
    first = _pass[int(_min) - 1] == _char
    second = _pass[int(_max) - 1] == _char
    print(first ^ second)

