#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <time.h>

pthread_mutex_t count_mutex     = PTHREAD_MUTEX_INITIALIZER;
pthread_mutex_t condition_mutex = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t  condition_cond  = PTHREAD_COND_INITIALIZER;

void *functionCount();
void *functionClock();
int  count = 0;
#define COUNT_DONE  10
#define COUNT_HALT1  3
#define COUNT_HALT2  6


void printtime(char *prefix) {

  struct timespec t = {0};
  clock_gettime(CLOCK_MONOTONIC, &t);
  printf("%s: %lds and %ldns\n", prefix, t.tv_sec, t.tv_nsec);

}

main()
{
  pthread_t thread1, thread2;

  printtime("start");

  pthread_create( &thread1, NULL, &functionCount, NULL);
  pthread_create( &thread2, NULL, &functionClock, NULL);

  pthread_join( thread1, NULL);
  //pthread_join( thread2, NULL);

  exit(0);
}

void *functionCount()
{

  unsigned long long int i = 0;
  for(;;)
  {

    printtime("count break");

    while(i < 0xffffffff/*ffffffff*/) i++;
    i = 0;

    printtime("count wait");

    pthread_mutex_lock( &condition_mutex );
    pthread_cond_wait( &condition_cond, &condition_mutex );
    pthread_mutex_unlock( &condition_mutex );

    printtime("count print");

    pthread_mutex_lock( &count_mutex );
    printf("Counter value functionCount: %d\n",count);
    pthread_mutex_unlock( &count_mutex );

  }
}

void *functionClock() {

  unsigned long long int i = 0;
  for(;;) {

    while(i < 0xfffffff/*fffffffff*/) i++;
    i = 0;


    pthread_mutex_lock( &condition_mutex );
    count++;
    pthread_cond_signal(&condition_cond);
    pthread_mutex_unlock( &condition_mutex );

    printtime("clock dispatch");
  }

}

/**
 *
 * start: 1741426s and 81497000ns
 * count break: 1741426s and 81602000ns
 * clock dispatch: 1741426s and 218902000ns
 * clock dispatch: 1741426s and 306025000ns
 * clock dispatch: 1741426s and 393028000ns
 * clock dispatch: 1741426s and 479778000ns
 * clock dispatch: 1741426s and 566535000ns
 * clock dispatch: 1741426s and 653643000ns
 * clock dispatch: 1741426s and 740562000ns
 * clock dispatch: 1741426s and 827412000ns
 * clock dispatch: 1741426s and 914304000ns
 * clock dispatch: 1741427s and 1185000ns
 * clock dispatch: 1741427s and 88331000ns
 * clock dispatch: 1741427s and 175566000ns
 * clock dispatch: 1741427s and 262383000ns
 * clock dispatch: 1741427s and 349138000ns
 * clock dispatch: 1741427s and 435896000ns
 * clock dispatch: 1741427s and 522647000ns
 * count wait: 1741427s and 523223000ns
 * clock dispatch: 1741427s and 606752000ns
 * count print: 1741427s and 606785000ns
 * Counter value functionCount: 17
 * count break: 1741427s and 606789000ns
 * clock dispatch: 1741427s and 693917000ns
 * clock dispatch: 1741427s and 780826000ns
 * clock dispatch: 1741427s and 867679000ns
 * clock dispatch: 1741427s and 954636000ns
 * clock dispatch: 1741428s and 41548000ns
 * clock dispatch: 1741428s and 129038000ns
 * clock dispatch: 1741428s and 216031000ns
 * clock dispatch: 1741428s and 302913000ns
 * clock dispatch: 1741428s and 389824000ns
 * clock dispatch: 1741428s and 476669000ns
 * clock dispatch: 1741428s and 563589000ns
 * clock dispatch: 1741428s and 650845000ns
 * clock dispatch: 1741428s and 737598000ns
 * clock dispatch: 1741428s and 824359000ns
 * clock dispatch: 1741428s and 911198000ns
 * count wait: 1741428s and 996722000ns
 * clock dispatch: 1741428s and 997939000ns
 * count print: 1741428s and 997972000ns
 * Counter value functionCount: 33
 * count break: 1741428s and 997975000ns
 * clock dispatch: 1741429s and 84685000ns
 * clock dispatch: 1741429s and 171825000ns
 * clock dispatch: 1741429s and 258568000ns
 * clock dispatch: 1741429s and 345411000ns
 * clock dispatch: 1741429s and 432161000ns
 * clock dispatch: 1741429s and 518920000ns
 * clock dispatch: 1741429s and 605661000ns
 * clock dispatch: 1741429s and 692946000ns
 * clock dispatch: 1741429s and 779680000ns
 * clock dispatch: 1741429s and 866441000ns
 * clock dispatch: 1741429s and 953187000ns
 * clock dispatch: 1741430s and 39973000ns
 * clock dispatch: 1741430s and 126936000ns
 * clock dispatch: 1741430s and 213841000ns
 * clock dispatch: 1741430s and 300642000ns
 * clock dispatch: 1741430s and 387393000ns
 * count wait: 1741430s and 390728000ns
 * clock dispatch: 1741430s and 471458000ns
 * count print: 1741430s and 471495000ns
 * Counter value functionCount: 50
 * count break: 1741430s and 471497000ns
 * clock dispatch: 1741430s and 558200000ns
 * clock dispatch: 1741430s and 645298000ns
 * clock dispatch: 1741430s and 732051000ns
 * clock dispatch: 1741430s and 818820000ns
 * clock dispatch: 1741430s and 905587000ns
* clock dispatch: 1741430s and 992376000ns
* clock dispatch: 1741431s and 79151000ns
* clock dispatch: 1741431s and 166394000ns
* clock dispatch: 1741431s and 253273000ns
* clock dispatch: 1741431s and 340188000ns
* clock dispatch: 1741431s and 427057000ns
*
