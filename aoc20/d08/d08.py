#! /usr/local/bin/python3
import sys

lns = list(sys.stdin)

acc = 0
ptr = 0

memory = []

op = {
        'acc': lambda x: (acc + x, ptr + 1),
        'nop': lambda x: (acc, ptr + 1),
        'jmp': lambda x: (acc, ptr + x),
        }


for i in range(0, len(lns)):
    if lns[i].split()[0] == 'jmp':
        lns[i] = lns[i].replace('jmp', 'nop')
    elif lns[i].split()[0] == 'nop':
        lns[i] = lns[i].replace('nop', 'jmp')
    else:
        continue

    ptr = 0
    acc = 0
    memory = []

    while True:
    
        if ptr >= len(lns):
            print("part2:")
            print(acc)
            break

        if ptr in memory:
            break
        memory += [ptr]

        [opc, x] = lns[ptr].split()

        (acc, ptr) = op[opc](int(x))

    if lns[i].split()[0] == 'nop':
        lns[i] = lns[i].replace('nop', 'jmp')
    elif lns[i].split()[0] == 'jmp':
        lns[i] = lns[i].replace('jmp', 'nop')


print("part1:")
print(acc)
