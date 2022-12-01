#! /usr/local/bin/python3
import operator
import sys
import math
from functools import reduce

lns = list(sys.stdin)

bus = list(
        filter(
            lambda x: x != 0,
            map(
                lambda x: (int(x[1]), x[0]) if x[1] != 'x' else 0,
                enumerate(lns[1].split(',')),
                )
            )
        )

eq = ""
for busId, pos in bus:
    eq += "((x + " + str(pos) + ") mod " + str(busId) + ") + "

print(eq[0:len(eq) - 3] + " = 0")

# https://www.wikiwand.com/fr/Th%C3%A9or%C3%A8me_des_restes_chinois
# http://defeo.lu/in310/poly/euclide-bezout/
# http://epsilon.2000.free.fr/Csup/resteschinois.pdf
# https://www.wikiwand.com/fr/Algorithme_d%27Euclide_%C3%A9tendu

# function for extended Euclidean Algorithm
def gcdExtended(a, b):
    # Base Case
    if a == 0 :
        return b,0,1

    gcd,x1,y1 = gcdExtended(b%a, a)

    # Update x and y using results of recursive
    # call
    x = y1 - (b//a) * x1
    y = x1

    return gcd,x,y

bus = [(3, 2), (5, 3), (7, 2)]

times = list(map(lambda v: v[1], bus))
busId = list(map(lambda x: x[0], bus))
print(busId)
n = reduce(operator.mul, busId, 1)
print ("n=", n)

nArrHat = list(map(lambda x: n // x, busId))
gcde = list(map(lambda x, v: gcdExtended(x, v)[1], nArrHat, busId))
eArr = list(map(lambda x, v: v * x, gcde, nArrHat))
xArr = list(map(lambda x, v: x * v, times, eArr))

print(gcdExtended(3, 35))

print(times)
print(busId)
print(nArrHat)
print("gde", gcde)
print(eArr)
print(xArr)
print(sum(xArr))



# print(gcdExtended(42, 5))
