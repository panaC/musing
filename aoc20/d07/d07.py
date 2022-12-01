#! /usr/local/bin/python3
import re
import sys

lns = list(sys.stdin)

pset = set()
mtx = {}

def find(bg):
    if bg not in pset:
        pset.update(bg)
        if bg in mtx:
            if 'shiny gold' in mtx[bg]:
                return True
            else:
                s = False
                for i in mtx[bg]:
                    s |= find(i)
                return s
    return False

for ln in lns:
    reg = re.findall(r"([1-9]?) ?([a-z]* [a-z]*) bags?", ln)

    (_, b) = reg[0]

    mtx[b] = mtx[b] if b in mtx else dict()


    for (i, bag) in reg[1:]:

        if bag == "no other":
            continue
        mtx[b] = dict([(bag, int(i))], **(mtx[b])) 

res = 0
for i in mtx:
    res += find(i)

print(res)
