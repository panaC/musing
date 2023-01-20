
#include <stdlib.h>
#include <stdio.h>
#include "test.h"

int main(int argc, char** argv) {

    printf("hello world from MAIN\n");
    

    test("hello world");

    return 0;
}

/***
 * 


sans déclaration -> extern "C"

> make                                                                                                                                                        ~/Documents/musing/c/cpptoc
gcc -Wall -c main.c -o main.o
g++ test.o main.o -o test
Undefined symbols for architecture arm64:
  "_test", referenced from:
      _main in main.o
ld: symbol(s) not found for architecture arm64
clang: error: linker command failed with exit code 1 (use -v to see invocation)
make: *** [test] Error 1

Avec cela fonctionne !

main > make                                                                                                                                                        ~/Documents/musing/c/cpptoc
g++ -Wall -c test.cpp -o test.o
gcc -Wall -c main.c -o main.o
g++ test.o main.o -o test
main > ./test                                                                                                                                                      ~/Documents/musing/c/cpptoc
hello world from MAIN
hello world
main >

maintenant que ce passe t-il si je créer une lib
 
*/