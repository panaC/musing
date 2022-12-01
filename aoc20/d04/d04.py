#! /usr/local/bin/python3
import sys


s = set()

requiredKeys = set(["byr", "iyr", "eyr", "hgt", "hcl", "ecl", "pid"])

count = 0

for line in sys.stdin:

    if line == "\n":
        count += requiredKeys <= s
        s = set()
        continue

    s.update([x.split(':')[0] for x in line.split()])

count += requiredKeys <= s
print(count)
