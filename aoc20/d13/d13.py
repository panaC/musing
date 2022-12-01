#! /usr/local/bin/python3
import sys
import math
from functools import reduce

lns = list(sys.stdin)

timestamp = int(lns[0])
bus = list(
        filter(
            lambda x: x != 0,
            map(
                lambda x: int(x) if x != 'x' else 0,
                lns[1].split(','),
                )
            )
        )

def calc(pvId, pvMin, cvId):
    minutes = cvId - timestamp % cvId
    return (cvId, minutes) if minutes < pvMin else (pvId, pvMin)

busId, mns = reduce(lambda pv, cv: calc(*pv, cv), bus, (0, 9999))

print(busId * mns)
