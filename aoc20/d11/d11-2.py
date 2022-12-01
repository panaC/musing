#! /usr/local/bin/python3
import sys
import math

lns = list(sys.stdin)
width = len(lns[0]) - 1
heigh = len(lns)

lnsWithoutEndline = list(map(lambda x: x.split()[0], lns))

layout = "".join(lnsWithoutEndline)
print(layout)
print(width, heigh)

def occupiedSeatCheck(pzl, x, y):
    if x < 0 or x >= width or y < 0 or y >= heigh:
        return 0;
    elif pzl[x + y * width] == '#':
        return 1
    else:
        return 0

def occupiedSeat(pzl, ptr):
    y = math.floor(ptr / width)
    x = ptr % width
    res = (occupiedSeatCheck(pzl, x + 1, y) +
            occupiedSeatCheck(pzl, x - 1, y) +
            occupiedSeatCheck(pzl, x + 1, y + 1) +
            occupiedSeatCheck(pzl, x + 1, y - 1) +
            occupiedSeatCheck(pzl, x - 1, y - 1) +
            occupiedSeatCheck(pzl, x - 1, y + 1) +
            occupiedSeatCheck(pzl, x, y - 1) +
            occupiedSeatCheck(pzl, x, y + 1))
    return res

def roundLife(pzl):
    res = ""
    for idx, val in enumerate(pzl):
        if val == 'L' and occupiedSeat(pzl, idx) == 0:
            res += '#'
        elif val == '#' and occupiedSeat(pzl, idx) >= 5:
            res += 'L'
        else:
            res += val
    return res, pzl == res

def printPzl(pzl):
    ptr = 0
    while (ptr <= len(pzl)):
        print("".join(pzl[ptr: ptr + width]))
        ptr += width
    print("")

printPzl(layout)
currentPzl, equal = roundLife(layout)
rnd = 0

while not equal:
    printPzl(currentPzl)
    currentPzl, equal = roundLife(currentPzl)
    rnd += 1

print("round:", rnd)
print("count:", currentPzl.count('#'))

