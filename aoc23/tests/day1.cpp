#include "aoc.h"
#include <gtest/gtest.h>
#include <iostream>

TEST(day1, part1) {

  EXPECT_EQ(day1(1, getAbsolutePath("input/day1_test")), 142);
  EXPECT_EQ(day1(1, getAbsolutePath("input/day1_test2")), 22);
}

TEST(day1, part2) {

  EXPECT_EQ(day1(2, getAbsolutePath("input/day1_testpart2")), 281);
}
