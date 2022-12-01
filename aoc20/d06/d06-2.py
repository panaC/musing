#! /usr/local/bin/python3
import sys

lns = list(sys.stdin) + ['\n']

s = set()
count = 0
flag= False

for l in lns:

    nl = l[:-1]

    if len(nl) == 0:
        print(s)
        count += len(s)
        s = set()
        flag = False
        continue

    s = set(nl) & s if flag else set(nl)
    flag = True

print(count)
