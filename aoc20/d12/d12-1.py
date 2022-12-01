#! /usr/local/bin/python3
import sys
import math
from functools import reduce

lns = list(sys.stdin)

def setAngle(deg, ang):
    x, y = ang
    rad = deg * (math.pi / 180)
    x2 = x * math.cos(rad) - y * math.sin(rad)
    y2 = x * math.sin(rad) + y * math.cos(rad)
    return (x2, y2)

def sumVec(a, b):
    return (a[0]+b[0], a[1]+b[1])

rules = {
        'N': lambda x, ang: ((0, x), ang),
        'S': lambda x, ang: ((0, -x), ang),
        'E': lambda x, ang: ((x, 0), ang),
        'W': lambda x, ang: ((-x, 0), ang),
        'L': lambda x, ang: ((0, 0), setAngle(x, ang)),
        'R': lambda x, ang: ((0, 0), setAngle(-x, ang)),
        'F': lambda x, ang: ((x * ang[0], x * ang[1]), ang),
        }

ang = (1, 0)
vec = []
for i in lns:

    action, value = i[0], int(i[1:])
    pos, ang = rules[action](value, ang)
    vec += [pos]
    print(action, value, pos, ang)

res = reduce(sumVec, vec, (0, 0))
print(res)
print(round(abs(res[0]) + abs(res[1])))
