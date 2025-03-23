#include <pthread.h>
#include <stdio.h>
#include <stdatomic.h>

// Shared atomic counter variable
atomic_int counter = ATOMIC_VAR_INIT(0);

// Function to update the counter
void* update_counter(void* arg) {
  for (int i = 0; i < 1000000; i++) {
    // Atomic update
    atomic_fetch_add_explicit(&counter, 1, memory_order_relaxed);
  }
  return NULL;
}

int main() {
  pthread_t thread1, thread2;

  pthread_create(&thread1, NULL, update_counter, NULL);
  pthread_create(&thread2, NULL, update_counter, NULL);

  pthread_join(thread1, NULL);
  pthread_join(thread2, NULL);

  printf("Final counter value: %d\n", atomic_load_explicit(&counter, memory_order_relaxed));

  return 0;
}
