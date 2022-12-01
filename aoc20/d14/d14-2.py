#! /usr/local/bin/python3
import sys
import math
import re

lns = list(sys.stdin)

maskFormat = ""
nbFloating = 0
mem = {}

reg = re.compile(r"^mem\[([0-9]*)\] = ([0-9]*)$")

for i in lns:
    i = i[:-1]
    if i.startswith("mask = "):
        maskstr = i.split()[2]
        print("mask: " + maskstr)
        mask0 = int(maskstr.replace('X', '0'), 2)
        maskFormat1 = maskstr.replace('X', '{:b}').replace('0', '1')
        maskFormat2 = maskstr.replace('X', '{:b}').replace('1', '0')
        nbFloating = maskstr.count('X')

        #print(maskFormat)
        continue

    addr, val = reg.match(i).groups()
    #print(addr, val)
    valInt = int(val)
    addrInt = int(addr)

    for j in range(2 ** nbFloating):
        jstrbin = list(("{:0" + str(nbFloating) + "b}").format(j))
        #print(jstrbin)
        jbin = list(map(lambda x: int(x), jstrbin))
        #print(jbin)
        addrFormated1 = maskFormat1.format(*jbin)
        addrFormated2 = maskFormat2.format(*jbin)
        #print(addrFormated)
        jaddr1 = int(addrFormated1, 2)
        jaddr2 = int(addrFormated2, 2)
        #print(jaddr)

        print("addf: {:036b}".format(addrInt))
        print("mask: {:036b}".format(mask0))
        print("addj: {:036b}".format(jaddr1))
        adma = (addrInt | mask0)
        print("adma: {:036b}".format(adma))
        addrMaskJaddr = jaddr1 & adma
        print("addr: {:036b}".format(addrMaskJaddr))
        addrMask2 = addrMaskJaddr | jaddr2

        mem[addrMask2] = mem.get(addr, valInt)
        mem[addrMask2] = valInt

        print("mem[{}] = {}".format(addrMask2, valInt))

print(mem)
val = [mem[x] for x in mem]
print(sum(val))
