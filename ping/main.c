#include <stdio.h>
#include <stdlib.h>
#include <strings.h>

#include <sys/socket.h>
#include <netinet/ip.h>
#include <netinet/in.h>
#include <netinet/ip_icmp.h>

int main(int argc, char **argv) {

  int fd;

  fd = socket(AF_INET, SOCK_RAW, IPPROTO_ICMP);

  printf("FD: %d\n", fd);
  if (fd < 0) {
    perror("ERROR opening socket");
    exit(1);
  }

  struct sockaddr_in serv_addr;
  // struct sockaddr addr;
  // sockaddr.sa_len = ;
  // sockaddr.sa_family = AF_INETo
   
  bzero((void *) &serv_addr, sizeof(serv_addr));

  serv_addr.sin_family = AF_INET;
  serv_addr.sin_port = 0;
  serv_addr.sin_addr.s_addr = 0x80808080;

  // sockaddr.sa_data = (void*) serv_addr;
 

  char buffer[64] = {0};

  ssize_t size = sendto(fd, buffer, sizeof(buffer), 0, (struct sockaddr*) &serv_addr, sizeof(serv_addr));

  printf("send %ld\n", size);
  if (size < 0) {
    perror("ERROR sendto");
    exit(1);
  }

}

