#! /usr/local/bin/python3
import re
import sys

lns = list(sys.stdin)

mtx = {}

def count(bg):
    c = 1
    for i in mtx[bg]:
        mult = mtx[bg][i]
        cou = count(i)
        c += mult * cou
    return c

for ln in lns:
    reg = re.findall(r"([1-9]?) ?([a-z]* [a-z]*) bags?", ln)

    (_, b) = reg[0]

    mtx[b] = mtx[b] if b in mtx else dict()


    for (i, bag) in reg[1:]:

        if bag == "no other":
            continue
        mtx[b] = dict([(bag, int(i))], **(mtx[b])) 

res = count('shiny gold') - 1

print(res)
