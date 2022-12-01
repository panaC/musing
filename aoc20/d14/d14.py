#! /usr/local/bin/python3
import sys
import math
import re

lns = list(sys.stdin)

mask0 = 0
mask1 = 0
mem = {}

reg = re.compile(r"^mem\[([0-9]*)\] = ([0-9]*)$")

for i in lns:
    i = i[:-1]
    if i.startswith("mask = "):
        maskstr = i.split()[2]
        mask0 = int(maskstr.replace('X', '0'), 2)
        mask1 = int(maskstr.replace('X', '1'), 2)

        print(maskstr)
        print("{0:36b}".format(mask0))
        print("{0:b}".format(mask1))
        continue

    addr, val = reg.match(i).groups()
    print(addr, val)
    valInt = int(val)

    print("{0:36b}".format(valInt), valInt)
    newVal = (valInt | mask0) & mask1
    print("{0:36b}".format(newVal), newVal)

    mem[addr] = mem.get(addr, newVal)
    mem[addr] = newVal

print(mem)
val = [mem[x] for x in mem]
print(sum(val))
