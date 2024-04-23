from lark import Lark
import sys
import re

# if the bag had been loaded with only 12 red cubes, 13 green cubes, and 14 blue cubes.

# parsing with lark or regexp

grammar = r"""
    start: "Game" NUMBER ": " color_list
    color_list: (color (";" | NEWLINE))*
    color: (cube ","?)*
    cube: NUMBER WORD
    %import common.NUMBER
    %import common.WORD
    %import common.WS
    %import common.NEWLINE
    %ignore NEWLINE
    %ignore WS
"""

parser = Lark(grammar, start='start')

sum = 0
sump2 = 0

regexp = re.compile(r"((\d) ([a-z]+)(,|;?))+")

for line in sys.stdin:

    print(line.strip())
    tree = parser.parse(line)
    game = tree.children[0].value

    t = 0
    good = 1
    colorlist = tree.children[1]

    red = 0
    green = 0
    blue = 0

    for color in colorlist.find_data("color"):
        t += 1
        for cube in color.find_data("cube"):
            [n,w] = cube.children
            print(f"game {game}: set {t} : {int(n.value)}:{w.value}")

            n = int(n.value)
            if good and ((w == "red" and n > 12) or (w == "green" and n > 13) or (w == "blue" and n > 14)):
                good = 0
            
            if w == "red" and red < n:
                red = n
            elif w == "green" and green < n:
                green = n
            elif w == "blue" and blue < n:
                blue = n

    if good:
        sum += int(game)
    
    sump2 += red * green * blue

    t = 1

    # same with regexp much more faster and shorter
    for (_, n, w, end) in regexp.findall(line.strip()):
        print(f"game {game}: set {t} : {int(n)}:{w}")
        if end == ";":
            t+=1

print(sum)

print(sump2)

