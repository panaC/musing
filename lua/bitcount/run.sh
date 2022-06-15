#https://www.quora.com/Is-there-a-coding-function-or-simple-code-to-determine-if-a-number-is-a-power-of-two/answer/Hanno-Behrens-2


gcc -O3 -mpopcnt -o bitcount bitcount.c 

time luajit bitcount.lua 1000000090
time ./bitcount 1000000090

