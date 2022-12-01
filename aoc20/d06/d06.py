#! /usr/local/bin/python3
import sys

lns = list(sys.stdin) + ['\n']

s = set()
count = 0

for l in lns:

    nl = l[:-1]

    if len(nl) == 0:
        print(s)
        count += len(s)
        s = set()
        continue

    s.update(set(nl))

print(count)
