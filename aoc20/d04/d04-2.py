#! /usr/local/bin/python3
import sys
import re

from functools import reduce

s = {}

requiredKeys = {
        "byr": lambda x: len(x) == 4 and int(x) >= 1920 and int(x) <= 2002,
        "iyr": lambda x: len(x) == 4 and int(x) >= 2010 and int(x) <= 2020,
        "eyr": lambda x: len(x) == 4 and int(x) >= 2020 and int(x) <= 2030,
        "hgt": lambda x: (int(x[:-2]) >= 150 and int(x[:-2]) <= 193) if x.endswith("cm") else (int(x[:-2]) >= 59 and int(x[:-2]) <= 76) if x.endswith("in") else False,
        "hcl": lambda x: not not re.search("^#[0-9a-z]{6}$", x),
        "ecl": lambda x: not not re.search("^(amb|blu|brn|gry|grn|hzl|oth)$", x),
        "pid": lambda x: not not re.search("^[0-9]{9}$", x),
        }

requiredKeysSet = set(["byr", "iyr", "eyr", "hgt", "hcl", "ecl", "pid"])

count = 0

def setCount():
        return requiredKeysSet <= set(s) and reduce(lambda pv, key: pv and requiredKeys[key](s[key]), requiredKeysSet, True)


for line in sys.stdin:

    if line == "\n":
        count += setCount()
        s = {}
        continue

    s.update([x.split(':') for x in line.split()])

count += setCount()
print(count)
