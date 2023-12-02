#include "aoc.h"
#include <filesystem>
#include <print>
int main(int argc, char **argv) {

  if (argc < 4)
    return 1;

  int part = strcmp(argv[2], "part1") == 0   ? 1
             : strcmp(argv[2], "part2") == 0 ? 2
                                             : 0;
  string filePath(getAbsolutePath(argv[3]));

  if (!fs::exists(filePath)) {
    println("filepath error : {}", filePath);
    return 1;
  }

  string day(argv[1]);

  if (!day.compare("day1"))
    println("Result: {}", day1(part, filePath));
  else {
    println("no day found");
    return 1;
  }

  return 0;
}
