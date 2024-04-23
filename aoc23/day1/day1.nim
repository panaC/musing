import std/strutils
# import prelude

var
    first: char = ' '
    last: char
    sum: int

    firstp2: int = 0
    lastp2: int
    sump2: int

const nbStringArray = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]

proc checkNb(line: string, i: int): int =
    if isDigit(line[i]):
        return ord(line[i]) - ord('0')
    for nbMapIndex in 0 ..< nbStringArray.len:
        if line.continuesWith(nbStringArray[nbMapIndex], i):
            return nbMapIndex + 1 
        
    return 0



for line in stdin.lines:

    first = ' '
    last = ' '
    for ch in line:
        if isDigit(ch):
            if first == ' ':
                first = ch
            last = ch

    sum += (ord(first) - ord('0')) * 10 + (ord(last) - ord('0'))

    firstp2 = 0
    lastp2 = 0
    for i in 0 ..< len(line):
        let nb = checkNb(line, i)
        if nb > 0:  
            if firstp2 == 0:
                firstp2 = nb
            lastp2 = nb
    
    sump2 += firstp2 * 10 + lastp2
    
echo "part1 ", sum
    
echo "part2 ", sump2