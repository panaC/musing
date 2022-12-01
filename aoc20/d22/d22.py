#! /usr/local/bin/python3
import operator
import sys
from collections import deque
from math import prod

#lns = map(lambda x: map(lambda y: int(y), filter(len, x.split('\n')[1:])), sys.stdin.read().split('\n\n'))
lns = [[int(y) for y in filter(len, x.split('\n')[1:])] for x in sys.stdin.read().split('\n\n')]

print(list(map(list, lns)))

q1 = deque(lns[0])
q2 = deque(lns[1])

while q1 and q2:
    v1 = q1.popleft();
    v2 = q2.popleft();

    if (v1 > v2):
        q1.extend([v1, v2])
    else:
        q2.extend([v2, v1])

print(q1, q2)

q1.reverse()
q2.reverse()

r = [i for i in q1] + [i for i in q2]
r = q1 or q2
z = list(zip(r, range(1, len(r) + 1)))
c = sum(list(map(lambda x: x[0] * x[1], z)))
b = sum(list(map(prod, z)))
v = sum(list(map(prod, enumerate(r, 1))))
print(c == v == b)
print(v)


