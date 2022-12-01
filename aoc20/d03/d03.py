#! /usr/local/bin/python3
import sys

ptr = 0

for line in sys.stdin:
    print(line[ptr % (len(line) - 1)] == '#' and ptr > 0)
    ptr += 3

print(ptr)
