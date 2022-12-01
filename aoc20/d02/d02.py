#! /usr/local/bin/python3
import re
import sys

for line in sys.stdin:
    [(_min, _max, _char, _pass)] = re.findall("^(.*)-(.*) ([a-z]): (.*)$", line)
    count = _pass.count(_char)
    print(count in range(int(_min), int(_max) + 1))

