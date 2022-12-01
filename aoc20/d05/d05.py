#! /usr/local/bin/python3
import sys

hight = 0

for line in sys.stdin:
    code = line[:-1]
    row = code[:-3].replace('F', '0').replace('B', '1')
    col = code[len(code)-3:].replace('L', '0').replace('R', '1')

    rowNb = int(row, 2)
    colNb = int(col, 2)

    result = rowNb * 8 + colNb
    hight = result if result > hight else hight


print(hight)
