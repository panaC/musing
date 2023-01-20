
libtest.a: test.o
	ar rcs $@ $<

test2: libtest.a main.o
	g++ -L. -ltest -I. main.o -o test2

test : test.o main.o 
	g++ test.o main.o -o test

test.o : test.h test.cpp
	g++ -Wall -c test.cpp -o test.o

main.o : test.h main.c
	gcc -Wall -c main.c -o main.o


.PHONY: clean
clean : 
	rm *.o test
