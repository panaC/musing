import sys
import re

data = []

for line in sys.stdin:
    data.append(line.strip())

sum = 0

for i in range(0, len(data)):

    line = data[i]
    # cardnumber = re.search(r"\d+", line).group()
    winning_number, having_number = [set(map(int, re.findall(r"\d+", x))) for x in line.split(": ")[1].split(" | ")]

    intersection = having_number & winning_number
    if len(intersection):
        sum += 1 << len(intersection) - 1

print(sum)