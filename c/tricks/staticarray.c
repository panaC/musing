

/**
 *
 * https://news.ycombinator.com/item?id=22865357#22870817
 *
 * staticarray.c:13:3: warning: array argument is too small; contains 1 elements, callee requires at least 42 [-Warray-bounds]
 *   foo(test2);
 *     ^   ~~~~~
 *     staticarray.c:3:14: note: callee declares array parameter as static here
 *     void foo(int array[static 42]) {
 *                  ^    ~~~~~~~~~~~
 *                  2 warnings generated.
 *
 */
                                                                                                                                                                                                
void foo(int array[static 42]) {
  // do something
}

main() {

  int test[123];
  foo(test);

  int test2[1];
  foo(test2);

  int test3[84];
  foo(*(&test));
}

