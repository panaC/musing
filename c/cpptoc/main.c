
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
> make                                                                                                                                                        ~/Documents/musing/c/cpptoc
gcc -Wall -c main.c -o main.o
g++ test.o main.o -o test
Undefined symbols for architecture arm64:
  "_test", referenced from:
      _main in main.o
ld: symbol(s) not found for architecture arm64
clang: error: linker command failed with exit code 1 (use -v to see invocation)
make: *** [test] Error 1
*/