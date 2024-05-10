import sys
import re

data = []

for line in sys.stdin:
    data.append(line.strip())

part1array = [0 for _ in data]

part2array = [0 for _ in data]

for i in range(0, len(data)):

    line = data[i]
    # cardnumber = re.search(r"\d+", line).group()
    winning_number, having_number = [set(map(int, re.findall(r"\d+", x))) for x in line.split(": ")[1].split(" | ")]

    intersection = having_number & winning_number
    matchingNumber = len(intersection)
    if matchingNumber:
        part1array[i] += 1 << matchingNumber - 1

    cardnumber = i
    part2array[i] += 1
    for _ in range(0, part2array[i]):
        for icopy in range(cardnumber + 1, cardnumber + matchingNumber + 1):
            part2array[icopy] += 1
    
print(sum(part1array))


print(sum(part2array))