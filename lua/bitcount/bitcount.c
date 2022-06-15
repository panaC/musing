#include <stdio.h> 
#include <stdlib.h> 
__attribute__((optimize("unroll-loops"))) // to unroll the loop "Duff's Device" 
int main(int argc, char **argv){ 
	if(argc < 2){ 
		printf("use: %s <num>\n", argv[0]); 
		exit(EXIT_FAILURE); 
	} 
	long to=atol(argv[1]); 
	for(long i=1; i<=to; ++i){ 
		if(__builtin_popcountl(i)==1) printf("%ld is a power of 2\n", i); 
	} 
} 
