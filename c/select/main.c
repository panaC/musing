
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/select.h>

int main() {
  int nfds = 1; //max fd
  char c = ' ';
  fd_set readfds;
  FD_ZERO(&readfds);
  FD_SET(0, &readfds); /* set the stdin in the set of file descriptors to be selected */
  while(1)
  {
    puts("yep");
    int count = select(nfds, &readfds, NULL, NULL, NULL);
    printf("count %d\n", count);
    if (count > 0) {
      if (FD_ISSET(0, &readfds)) {
        // getchar();
        read(0, &c, 1);
        putchar(c);
        break;
      }
    }
  }

  return 0;
}
