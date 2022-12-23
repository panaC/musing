
import sys

def split(list_a, chunk_size):

  for i in range(0, len(list_a), chunk_size):
    yield list_a[i:i + chunk_size]

file = open(sys.argv[1]);
lines = file.readlines();

monkeysraw = list(split(lines, 7));

for m in monkeysraw:
    m.pop(0)
    m[0] = m[0][len("  Starting items: "):-1]
    m[0] = m[0].replace(",", "")
    m[1] = m[1][len("  Operation: new = "):-1]
    m[2] = m[2][len("  Test: divisible by "):-1]
    m[3] = m[3][len("    If true: throw to monkey "):-1]
    m[4] = m[4][len("    If false: throw to monkey "):-1]
    m.pop(5);

print(monkeysraw);

out = open(sys.argv[2], "w")

for m in monkeysraw:
    for l in m:
        print(l)
        out.write(l + "\n")
    out.write("\n")

