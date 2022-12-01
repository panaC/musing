#! /usr/local/bin/python3
import sys
import math
import re

#lns = list(map(int, sys.stdin.readline()[:-1].split(",")))
lns = [12,20,0,6,1,17,7]

def run(goal):
    table = { k: v for v, k in enumerate(lns, 1)}
    print(table)
    last = lns[-1]

    for turn in range(len(lns), goal):

        if last in table:
            spoken = turn - table[last]
        else:
            spoken = 0

        table[last] = turn
        last = spoken

    return last

print(run(2020))
print(run(30000000))
