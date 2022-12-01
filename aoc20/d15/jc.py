def solve(s, n):
  inputs = list(map(int, s.split(',')))
  d = {k: v for v, k in enumerate(inputs[:-1])}
  last = inputs[-1]
  for i in range(len(inputs) - 1, n-1):
    if last in d:
      cur = i - d[last]
    else:
      cur = 0
    d[last] = i
    last = cur
  return last


def part1():
  return solve("12,20,0,6,1,17,7", 2020)


def part2():
  return solve("12,20,0,6,1,17,7", 30000000)


print(part1())
print(part2())
