#! /usr/local/bin/python3
import sys

lns = list(map(int, sys.stdin))

flag=False

target = 0
ptr = 0
tracker = 0
suba = []
offset = 26

for i in range(offset, len(lns)):

    target = lns[i]
    flag=False

    for j in lns[i-offset:i]:
        for n in lns[i-offset:i]:
            if j + n == target:
                flag=True

    if flag == False:
        print("part1:")
        print(target)
        ptr = i
        break

while ptr > tracker:
    for i in range(tracker, ptr):
        suba += [lns[i]]
        # print(suba, sum(suba), target, sum(suba) == target)
        sumSuba = sum(suba)
        if sumSuba == target:
            print("part2:")
            print(min(suba) + max(suba))
        if sumSuba > target:
            break


    tracker += 1
    suba = []
