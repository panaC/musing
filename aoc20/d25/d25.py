#! /usr/local/bin/python3
import operator
import sys
from collections import deque
from math import prod

pubKeys = [int(x) for x in sys.stdin.read().split("\n")[:2]]

subject = [1 for i in pubKeys]

print(pubKeys)

handDivisor = 20201227

acc = [0 for i in pubKeys]

for i, k in enumerate(pubKeys):
    while k != subject[i]:
        acc[i] += 1
        subject[i] = (subject[i] * 7) % handDivisor

print(acc)
print(pow(pubKeys[0], acc[1], handDivisor), pow(pubKeys[0], acc[1], handDivisor))


