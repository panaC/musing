#! /usr/local/bin/python3
import operator
import sys
from collections import deque
from math import prod

#lns = map(lambda x: map(lambda y: int(y), filter(len, x.split('\n')[1:])), sys.stdin.read().split('\n\n'))
lns = [[int(y) for y in filter(len, x.split('\n')[1:])] for x in sys.stdin.read().split('\n\n')]

print(list(map(list, lns)))

players = list(map(deque, lns))
print(players)

def game(p, g = 1):
    acc = set()
    while p[0] and p[1]:
        current = tuple(p[0]), tuple(p[1])
        if current in acc:
            r = p[0] or p[1]
            r.reverse()
            return r, 0
        acc.add(current)
        v1 = p[0].popleft();
        v2 = p[1].popleft();
        if len(p[0]) >= v1 and len(p[1]) >= v2:
            d1 = deque(list(p[0])[:v1])
            d2 = deque(list(p[1])[:v2])
            _, w = game([d1, d2], g+1)
            drews = [v1, v2]
            if w == 1:
                drews.reverse()
            p[w].extend(drews)
        elif v1 > v2:
            p[0].extend([v1, v2])
        else:
            p[1].extend([v2, v1])

    r = p[0] or p[1]
    r.reverse()

    return r, 1 if len(p[0]) == 0 else 0

r, _ = game(players)

z = list(zip(r, range(1, len(r) + 1)))
v = sum(list(map(prod, enumerate(r, 1))))
print(v)


