#! /usr/local/bin/python3
import sys
import math

lns = sorted(list(map(int, sys.stdin)))

startJolt = 0
curJolt = startJolt
deviceJolt = max(lns) + 3
lnreverse = list(reversed([startJolt] + lns + [deviceJolt]))
print(lnreverse)

nmap = {}

for i in lnreverse:
    for j in lnreverse[1:]:
        if j < i - 3:
            break;
        if j == i - 1 or j == i - 3 or j == i - 2:
            nmap[j] = nmap.get(j, []);
            nmap[j] += [i]

print(nmap)

cmap = {deviceJolt: 1}
for i in lnreverse[1:]:
    cmap[i] = 0
    for n in nmap[i]:
        cmap[i] += cmap[n]


print(cmap)

carr = [cmap[i] for i in cmap]
res = max(carr)
print(res)
