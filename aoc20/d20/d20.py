#! /usr/local/bin/python3
import sys
from math import sqrt
import re
from collections import defaultdict

lns = sys.stdin.read().split('\n\n')
print(lns)

tiles = defaultdict(list)

for l in lns:
    tmpid = int(re.search(r"\d+", l)[0])
    tiles[tmpid] = l.split("\n")[1:]

side = int(sqrt(len(tiles)))
t = [[i for i, _ in tiles[j*side:(j + 1)*side]] for j in range(0, side)]
print(t)

#print(tiles)

