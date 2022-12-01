
#include <string.h>
#include <stdio.h>

int ini[] = {0,3,6};

#define INT_SIZE	sizeof(int)
#define BIG_SIZE	30000000

void run(int goal) {

	putchar('1');
	putchar('\n');
	int start = sizeof(ini) / INT_SIZE;
	int tab[BIG_SIZE]; // segv on 30000000
	// ulimit -a
	// 8mB stack size
	putchar('1');
	putchar('\n');
	memset(tab, 0, INT_SIZE * goal);
	for (int i = 0; i < start; i++) {
		tab[ini[i]] = i + 1;

		// printf("%d:%d\t", ini[i], i + 1);
	}
	//printf("\n");

	int last = ini[start - 1];
	int spoken = 0;

	for (int turn = start; turn < goal; turn++) {

		if (last >= goal || last < 0) {
			printf("err %d", last);
		}

		if (tab[last] != 0) {
			spoken = turn - tab[last];
		} else {
			spoken = 0;
		}

		tab[last] = turn;
		last = spoken;
	}

	printf("%d\n", last);

}

int main() {

	run(2020);
	putchar('\n');
	run(30000000);
	return 0;
}
