#! /usr/local/bin/python3
import sys

from functools import reduce
import operator

class Tree:
    def __init__(self, right, down):
        self.ptr = 0
        self.res = 0
        self.right = right
        self.down = down

    def run(self, ln, _lc, _ll):
        self.res += (ln[self.ptr % _ll] == '#' and _lc % self.down == 0)
        self.ptr += self.right if _lc % self.down == 0 else 0

slp = [Tree(1, 1), Tree(3, 1), Tree(5, 1), Tree(7, 1), Tree(1, 2)];
#slp = [Tree(3, 1)]

#firstLn = sys.stdin.readline()
lnCount = 0

for line in sys.stdin:
    lnLen = len(line) - 1;
    for v in slp:
        v.run(line, lnCount, lnLen)
    lnCount += 1

t = map(lambda v: v.res, slp)
re = list(t) # cannot be called many times !?
#print(re)
print(reduce(operator.mul, re, 1));
