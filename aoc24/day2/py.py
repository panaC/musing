
# with open("test.txt", "r", encoding="utf-8") as f:
#     file = f.read()

with open("input.txt", "r", encoding="utf-8") as f:
    file = f.read()

lines = file.strip().split("\n")

count = 0;

for line in lines: 
    numbers = list(map(int, line.split()))

    tup = lambda nb: [nb[i] - nb[i-1] for i in range(1, len(nb))]
    goods = lambda t: [v != 0 and (v > 0) == (t[0] > 0) and 0 < abs(v) <= 3 for v in t]

    if all(x for x in goods(tup(numbers))):
        count += 1
    else:
        for i in range(len(numbers)):
            tolerance_numbers = numbers[:i] + numbers[i+1:]

            if all(x for x in goods(tup(tolerance_numbers))):
                count += 1
                break

print(count)
