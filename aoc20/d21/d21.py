#! /usr/local/bin/python3
import random
import sys
from math import sqrt
import re
from collections import defaultdict

lns = list(filter(len, sys.stdin.read().split('\n')))

graph = defaultdict(list)
allergens = set()
ingredients = set()
ingredientsDict = []
i = 0

for l in lns:
    i += 1
    word = re.split(r"\W+", l)
    word = list(filter(len, word))
    containsIndex = word.index("contains")
    ing = set(word[:containsIndex])
    ale = set(word[containsIndex + 1:])
    ingredientsDict += word[:containsIndex]
    allergens.update(ale)
    ingredients.update(ing)

    for a in ale:
        graph[a].append(ing)

print(graph)
print(len(ingredients), len(ingredientsDict))

graphReduce = defaultdict(lambda : ingredients)

for allerg in graph:
    for ingred in graph[allerg]:
        graphReduce[allerg] = graphReduce[allerg] & ingred

print(graphReduce)

match = {}
found = set()


while len(graphReduce) > 0:
    
    v = list(enumerate(graphReduce))

    for _, key in v:
        if len(graphReduce[key]) == 1:
            match[key] = graphReduce[key].pop()
            found |= set([match[key]])
            del graphReduce[key]

    for key in graphReduce:
        graphReduce[key] -= found

print(found)
print(graphReduce)
print(match)

ingreFiltered = list(filter(lambda x: x not in match.values(), ingredientsDict))

print(len(ingreFiltered))

str = ''
for k in sorted(match):
    str += match[k] + ","



print(str)
