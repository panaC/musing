#! /usr/local/bin/python3
import sys
import math

lns = list(sys.stdin)

def setAngle(deg, ang):
    x, y = ang
    rad = deg * (math.pi / 180)
    x2 = x * math.cos(rad) - y * math.sin(rad)
    y2 = x * math.sin(rad) + y * math.cos(rad)
    return (round(x2), round(y2))

def forward(v, pos, ang):
    return (pos[0] + ang[0] * v, pos[1] + ang[1] * v)

rules = {
        'N': lambda x, pos, ang: ((pos[0], pos[1] + x), ang),
        'S': lambda x, pos, ang: ((pos[0], pos[1] - x), ang),
        'E': lambda x, pos, ang: ((pos[0] + x, pos[1]), ang),
        'W': lambda x, pos, ang: ((pos[0] - x, pos[1]), ang),
        'L': lambda x, pos, ang: (pos, setAngle(x, ang)),
        'R': lambda x, pos, ang: (pos, setAngle(-1 * x, ang)),
        'F': lambda x, pos, ang: (forward(x, pos, ang), ang),
        }

pos = (0, 0)
ang = (1, 0)

for i in lns:

    action = i[0]
    value = int(i[1:len(i) - 1])

    pos, ang = rules[action](value, pos, ang)

    print(action, value, pos, ang)

print(abs(pos[0]) + abs(pos[1]))
