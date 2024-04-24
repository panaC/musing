import sys
import re

pattern = r"\d+"

data = []

for line in sys.stdin:
    data.append(line.strip())

keep = []
keepp2 = []

symb = list(map(chr, range(ord('0'), ord('9')+1))) + ['.']

for i in range(0, len(data)):

    line = data[i]
    found = re.finditer(pattern, line)

    for match in found:
        str = match.group()
        (istart, istop) = match.span()
        istart = 0 if istart == 0 else istart-1
        istop = len(data) - 1 if istop >= (len(data) - 1) else istop+1
        assert istop < len(data), istop

        ystart = i-1 if i > 0 else i
        ystop = i+1 if i < len(data) - 1 else i

        tl = (not all(c in symb for c in data[i][istart:istop]))
        above = i > 0 and not all(c in symb for c in data[i-1][istart:istop])
        below = i < len(data) - 1 and not all(c in symb for c in data[i+1][istart:istop])

        # print(data[i-1][istart:istop] if i > 0 else "", data[i][istart:istop], data[i+1][istart:istop] if i < len(data) - 1 else "", above, tl, below)
        if tl or above or below:
            keep.append(int(str))

            sset = {}
            x_start, y_start, x_len, y_len = istart, ystart, istop - istart, ystop - ystart + 1
            assert x_start + x_len <= len(data[i]), x_start + x_len
            assert y_start + y_len <= len(data), y_start + y_len
            sset = {(x, y) for x in range(x_start, x_start + x_len) for y in range(y_start, y_start+y_len)}

            keepp2.append([int(str), sset])

print(sum(keep))

# dict[(gear), set]
state = []
intersections = []

# create intersection from matrix overlap
for nb_1, sset_1 in keepp2:
    for nb_2, sset_2 in keepp2:
        res = sset_1 & sset_2
        if res and not nb_1 == nb_2 and not res in intersections:
            state.append([(nb_1, nb_2), res])
            intersections.append(res)
# print(state)

# map and check if it is a symbol, filter and return gear to calculate gear ratio
gears = list(map(lambda x: x[0], (filter(lambda a: not a[1], [[a, all([data[y][x] in symb for x,y in sset])] for [a, sset] in state ]))))
# print(gears)

print(sum(map(lambda x: x[0]*x[1], gears)))