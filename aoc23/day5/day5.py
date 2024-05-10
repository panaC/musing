import sys
import re
from copy import copy

seeds = list(map(int, re.findall(r"\d+", sys.stdin.readline())))
seedsp2 = []
for i in range(0, len(seeds), 2):
    seedsp2.append((seeds[i], seeds[i]+seeds[i+1]))


sys.stdin.readline()
lines = sys.stdin.read().strip()

# part1
data = list(map(lambda x: list(map(lambda y: list(map(int, re.findall(r"\d+", y))), x.split("\n")[1:])), lines.split("\n\n")))

for i in range(0, len(seeds)):
    for maplist in data:
        for r in maplist:
            dest = r[0]
            src = r[1]
            length = r[2]
            seed = seeds[i]
            if seed >= src and seed < src + length:
                seeds[i] = dest + (seed - src)
                break

# bruteforce version
print("Part1:", min(seeds))


# part2

class RangeItem:
    def __init__(self, start: int, end: int, offset: int, revoff: int = 0):
        self.start = start
        self.end = end
        self.offset = offset
        self.reverseOffset = revoff

    def __lt__(self, other):
        return self.end < other.end if self.start == other.start else self.start < other.start
    
    def __str__(self):
        return f"({self.start}, {self.end}, {self.offset}, {self.reverseOffset})"

    def __repr__(self):
        return f"<RangeItem {self.__str__()}>"

    def reverse(self):
        return RangeItem(self.start + self.offset, self.end + self.offset, 0, self.reverseOffset + -1 * self.offset)

    def rereverse(self):
        return RangeItem(self.start + self.reverseOffset, self.end + self.reverseOffset, -1 * self.reverseOffset, 0)
    
    def merge(self, other): 
        prev = self if self.__lt__(other) else other
        next = other if self.__lt__(other) else self

        # assert prev.start >= 0, prev
        # assert prev.end >= 0, prev
        # assert next.start >= 0, next
        # assert next.end >= 0, next
        # assert prev.start < prev.end
        # assert next.start < next.end

        if (prev.end <= next.start):
            return [prev, next]
        if (prev.start == next.start and prev.end == next.end):
            return [RangeItem(prev.start, prev.end, prev.offset + next.offset, prev.reverseOffset + next.reverseOffset)]
        elif (prev.start < next.start and prev.end == next.end):
            return [RangeItem(prev.start, next.start, prev.offset, prev.reverseOffset), RangeItem(next.start, next.end, prev.offset + next.offset, prev.reverseOffset + next.reverseOffset)]
        elif (prev.start == next.start and prev.end < next.end):
            return [RangeItem(prev.start, prev.end, prev.offset + next.offset, prev.reverseOffset + next.reverseOffset), RangeItem(prev.end, next.end, next.offset, next.reverseOffset)]
        elif (prev.start == next.start and prev.end > next.end):
            assert(False)
        elif (prev.start < next.start and prev.end < next.end):
            return [RangeItem(prev.start, next.start, prev.offset, prev.reverseOffset), RangeItem(next.start, prev.end, prev.offset + next.offset, prev.reverseOffset + next.reverseOffset), RangeItem(prev.end, next.end, next.offset, next.reverseOffset)]
        elif (prev.start < next.start and prev.end > next.end):
            return [RangeItem(prev.start, next.start, prev.offset, prev.reverseOffset), RangeItem(next.start, next.end, prev.offset + next.offset, prev.reverseOffset + next.reverseOffset), RangeItem(next.end, prev.end, prev.offset, prev.reverseOffset)]
        else:
            assert(False)

# [destination, source, length]
def createRange(z: list[int]) -> RangeItem:
    return RangeItem(z[1], z[1] + z[2], z[0] - z[1])

# rangeSet version
data = list(map(lambda x: list(map(lambda y: createRange(list(map(int, re.findall(r"\d+", y)))), x.split("\n")[1:])), lines.split("\n\n")))
flattenData = [x for sublist in data for x in sublist]
sortedData = list(map(sorted, data))
# print(sortedData)

def mergeRangeSet(data: list[RangeItem]):

    mergeset = copy(data)
    notfinished = True
    while notfinished:
        for i in range(1, len(mergeset)):

            if mergeset[i-1].end > mergeset[i].start:
                _merge = mergeset[i-1].merge(mergeset[i])
                for v in _merge:
                    # print(v)
                    assert(v.start < v.end)
                mergeset = mergeset[:i-1] + _merge + mergeset[i+1:]
                break

            if i+1 == len(mergeset):
                notfinished = False
        mergeset.sort()
    
    return mergeset


# test
# rr = sortedData[0] + sortedData[1]
# assert(rr.__repr__() == "[<RangeItem (50, 98, 2)>, <RangeItem (98, 100, -48)>, <RangeItem (0, 15, 39)>, <RangeItem (15, 52, -15)>, <RangeItem (52, 54, -15)>]")
# # [<RangeItem (50, 98, 2)>, <RangeItem (98, 100, -48)>, <RangeItem (0, 15, 39)>, <RangeItem (15, 52, -15)>, <RangeItem (52, 54, -15)>]
# print(rr)
# rrMerge = mergeRangeSet(rr)
# # [<RangeItem (0, 15, 39)>, <RangeItem (15, 50, -15)>, <RangeItem (50, 52, -13)>, <RangeItem (52, 54, -13)>, <RangeItem (54, 98, 2)>, <RangeItem (98, 100, -48)>]
# assert(rrMerge.__repr__() == "[<RangeItem (0, 15, 39)>, <RangeItem (15, 50, -15)>, <RangeItem (50, 52, -13)>, <RangeItem (52, 54, -13)>, <RangeItem (54, 98, 2)>, <RangeItem (98, 100, -48)>]")
# print(rrMerge)

# in1 = sortedData[0]
# print(in1)
# in1Reverse = list(map(lambda x: x.reverse(), in1))
# print(in1Reverse)
# in2 = sortedData[1]
# print(in2)
# in1ReversePlusIn2 = mergeRangeSet(in1Reverse + in2)
# print(in1ReversePlusIn2)

in1 = sortedData[0]
in1Reverse = list(map(lambda x: x.reverse(), in1))
mergeSet = in1Reverse

# print("MS", mergeSet)
for rr in sortedData[1:]:
    # print("IN", rr)
    mergeSet = mergeRangeSet(mergeSet + rr)
    # print("MS", mergeSet)
    mergeSet = list(map(lambda x: x.reverse(), mergeSet))
    # print("MR", mergeSet)
    # flatSet = list(map(lambda x: x.rereverse(), mergeSet))
    # flatSet.sort()
    # print("FR", flatSet)

rereverseSet = list(map(lambda x: x.rereverse(), mergeSet))
rereverseSet.sort()
# print(rereverseSet)

# rereverseReverseSet = list(map(lambda x: x.reverse(), rereverseSet))
# rereverseReverseSet.sort()
# print(rereverseReverseSet)

rereverseSetSorted = sorted(rereverseSet, key=lambda x: x.start + x.offset)
# print(rereverseSetSorted)

res = 0
lowest = 0
# print(seedsp2)
for v in rereverseSetSorted:
    for (vs, ve) in seedsp2:
        # range (vs - ve) overlap the range v ? 
        mer = v.merge(RangeItem(vs, ve, 0))
        if len(mer) == 3:
            res = mer[1].start
            lowest = mer[1].start + mer[1].offset
            break
    
    if res:
        break

# print(res)
print("Part2:", lowest)

"""
Part1: 26273516
Part2: 34039469
python3 day5.py < in  0.06s user 0.01s system 93% cpu 0.077 total
""" 