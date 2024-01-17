

import sys


res1=0
res2=0

for line in sys.stdin:

    l=0;
    r=0;
    for c in line:
        if c >= '0' and c <= '9':
            if (l==0):
                l=ord(c)-ord('0');
            r=ord(c)-ord('0');
    
    res1+= l*10+r

    #######

    l=0;
    r=0;

    num={1:"one", 2:"two", 3:"three", 4:"four", 5:"five", 6:"six", 7:"seven", 8:"eight",9:"nine"}

    for i in range(len(line)):
        for key in num:
            c = line[i]
            if c >= '0' and c <= '9':
                if (l==0):
                    l=ord(c)-ord('0');
                r=ord(c)-ord('0');
            elif line[i:].startswith(num[key]):
                if l == 0:
                    l=key
                r=key
    res2+= l*10+r


if len(sys.argv) > 1 and sys.argv[1] == '2':
    print(res2);
else:
    print(res1);

