all: clean cgocpp

cgocpp: libtestcgocpp.a
	GOPATH=$(PWD)/build CGO_ENABLED=1 go install -x test/cgocpp

libtestcgocpp.a : test.o
	ar rcs $@ $<

test.o : test.h test.cpp
	g++ -Wall -c test.cpp -o test.o

.PHONY: clean
clean : 
	rm -rf *.o build libtestcgocpp.a
