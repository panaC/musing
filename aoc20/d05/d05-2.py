#! /usr/local/bin/python3
import sys

s = set()

low = 999999
hight = 0

for line in sys.stdin:
    code = line[:-1]
    row = code[:-3].replace('F', '0').replace('B', '1')
    col = code[len(code)-3:].replace('L', '0').replace('R', '1')

    rowNb = int(row, 2)
    colNb = int(col, 2)

    result = rowNb * 8 + colNb
    s.add(result)

    hight = result if result > hight else hight
    low = result if low > result else low


print(low, hight)
srange = set(range(low, hight + 1)) # hight = 930
print(s ^ srange)
