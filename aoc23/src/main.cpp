#include <iostream>
#include <filesystem>
#include <print>
#include "aoc.h"

using namespace std;
namespace fs = std::filesystem;

fs::path getAbsolutePath(string day, string relativePath) {
    // Get the current executable path
    fs::path executablePath = fs::current_path();

    // Append the relative path
    fs::path absolutePath = executablePath / "input" / (day+relativePath);

    return absolutePath;
}

int main(int argc, char** argv) {

  if (argc < 4) return 1;

  int part = strcmp(argv[2], "part1") == 0 ? 1 : strcmp(argv[2], "part2") == 0 ? 2 : 0;
  string filePath(getAbsolutePath(argv[1], argv[3]));

  if (!fs::exists(filePath)) {
    println("filepath error : {}", filePath);
    return 1;
  }

  string day(argv[1]);

   if (!day.compare("day1")) day1(part, filePath);
   else println("no day found");return 1;

  return 0;
}
