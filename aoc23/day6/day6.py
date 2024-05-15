import math

# Time:      7  15   30
# Distance:  9  40  200

test = [(7,9), (15, 40), (30, 200)]

# Time:        59     68     82     74
# Distance:   543   1020   1664   1022

val = [(59,543), (68, 1020), (82, 1664), (74, 1022)]


set = test

sum = 1
for (time, dist) in set:
    count = 0
    for i in range(0, time):
        if ((time - i) * i) > dist:
            count += 1
    sum *= count

print(sum)

# Time:      7  15   30
# Distance:  9  40  200

test = [(7_15_30,9_40_200)]

# Time:        59     68     82     74
# Distance:   543   1020   1664   1022

val = [(59_68_82_74,543_1020_1664_1022)]

set = val

sum = 1
for (time, dist) in set:
    # quadractic equation
    # (time - x) * x - dist
    # -x^2 + time * x - dist
    a = -1
    b = time
    c = -1 * dist
    discrimant = b*b - 4 * a * c
    root1 = (-b + (discrimant**(1/2))) / (2 * a)
    root1 = math.ceil(root1) if root1 % 1 != 0 else root1 + 1
    root2 = (-b - (discrimant**(1/2))) / (2 * a)

    sum *= math.ceil(root2 - root1)
    

print(sum)

