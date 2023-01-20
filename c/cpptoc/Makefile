
test : test.o main.o 
	g++ test.o main.o -o test

test.o : test.h test.cpp
	g++ -Wall -c test.cpp -o test.o

main.o : test.h main.c
	gcc -Wall -c main.c -o main.o


.PHONY: clean
clean : 
	rm *.o test
