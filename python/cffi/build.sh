gcc -c test.c && ar -cvq libtest.a test.o
gcc -o libtest.so --shared test.o