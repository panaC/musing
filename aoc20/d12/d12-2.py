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

def mulVec(a, mul):
    return (a[0] * mul, a[1] * mul)

rules = {
        'N': lambda x, way: sumVec(way, (0, x)),
        'S': lambda x, way: sumVec(way, (0, -x)),
        'E': lambda x, way: sumVec(way, (x, 0)),
        'W': lambda x, way: sumVec(way, (-x, 0)),
        'L': lambda x, way: setAngle(x, way),
        'R': lambda x, way: setAngle(-x, way),
        }

way = (10, 1)
shi = (0, 0)
for i in lns:

    action, value = i[0], int(i[1:])
    if action == 'F':
        shi = sumVec(shi, mulVec(way, value))
        continue
    way = rules[action](value, way)
    print(action, value, shi, way)

res = shi
print(round(abs(res[0]) + abs(res[1])))
