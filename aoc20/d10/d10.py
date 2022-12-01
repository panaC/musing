#! /usr/local/bin/python3
import sys

lns = sorted(list(map(int, sys.stdin)))

startJolt = 0
curJolt = startJolt
deviceJolt = max(lns) + 3
lns = [startJolt] + lns
lns2 = lns[1:]
lns2 += [deviceJolt]

diff = [b-a for a,b in zip(lns, lns2)]
print(diff)

jolt3 = diff.count(3)
jolt1 = diff.count(1)

print(jolt1, jolt3)
print(jolt1 * jolt3)
