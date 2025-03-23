#include <pthread.h>
#include <stdio.h>

// Shared counter variable
volatile int counter = 0;

// Function to update the counter
void* update_counter(void* arg) {
  for (int i = 0; i < 1000000; i++) {
    // Non-atomic update
    counter++;
  }
  return NULL;
}

int main() {
  pthread_t thread1, thread2;

  pthread_create(&thread1, NULL, update_counter, NULL);
  pthread_create(&thread2, NULL, update_counter, NULL);

  pthread_join(thread1, NULL);
  pthread_join(thread2, NULL);

  printf("Final counter value: %d\n", counter);

  return 0;
}
