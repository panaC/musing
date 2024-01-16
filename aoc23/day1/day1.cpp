#include <algorithm>
#include <cstdlib>
#include <fstream>
#include <iterator>
#include <print>
#include <string>
#include <unordered_map>
#include <iostream>

using namespace std;

inline bool isdigit(char v) { return v >= '0' && v <= '9'; }

int part1(istream& in) {

  int total = 0;
  int value = 0;
  char digit1 = '-';
  char digit2 = '-';

  string str;
  while (getline(in, str)) {
    value = 0;
    digit1 = '-';
    digit2 = '-';

    {
      string::iterator it;
      for (it = str.begin(); it != str.end(); it++) {
        if (isdigit(*it)) {
          digit1 = *it;
          value += 10 * (digit1 - '0');
          break;
        }
      }
    }
    {
      string::reverse_iterator it;
      for (it = str.rbegin(); it != str.rend(); it++) {
        if (isdigit(*it)) {
          digit2 = *it;
          value += 1 * (digit2 - '0');
          break;
        }
      }
    }

    // println("value {}", value);
    if (getenv("DEBUG"))
      println("{} {} {} {}", str, digit1, digit2, value);
    total += value;
  }

  return total;
}

int part2(istream& in) {

  int total = 0;
  int value = 0;
  char digit1 = '-';
  char digit2 = '-';

  const unordered_map<int, string> digit = {
      {0, "zero"}, {1, "one"}, {2, "two"},   {3, "three"}, {4, "four"},
      {5, "five"}, {6, "six"}, {7, "seven"}, {8, "eight"}, {9, "nine"}};

  string str;
  while (getline(in, str)) {
    value = 0;
    digit1 = '-';
    digit2 = '-';

    {
      string::iterator it;
      for (it = str.begin(); it != str.end(); it++) {
        const string sub = string(it, str.end());
        if (isdigit(*it)) {
          digit1 = *it;
          value += 10 * (digit1 - '0');
          break;
        } else if (auto itdigit = find_if(
                       digit.begin(), digit.end(),
                       [&](auto &e) { return sub.starts_with(e.second); });
                   itdigit != digit.end()) {
          digit1 = '0' + (*itdigit).first;
          value += 10 * (digit1 - '0');
          break;
        }
      }
    }
    {
      string::reverse_iterator it;
      for (it = str.rbegin(); it != str.rend(); it++) {

        // be careful here the base iterator refers to the element that is next
        // to the element the reverse_iterator is currently pointing to.
        // https://en.cppreference.com/w/cpp/iterator/reverse_iterator/base
        const string sub = string(it.base() - 1, str.end());
        // println("{} {}", sub, *it);
        if (isdigit(*it)) {
          digit2 = *it;
          value += 1 * (digit2 - '0');
          break;
        }
        auto itdigit = find_if(digit.begin(), digit.end(),
                               [&](auto &e) { return sub.contains(e.second); });
        if (itdigit != digit.end()) {
          digit2 = '0' + (*itdigit).first;
          value += 1 * (digit2 - '0');
          break;
        }
      }
    }

    // println("value {}", value);
    if (getenv("DEBUG"))
      println("{} {} {} {}", str, digit1, digit2, value);
    total += value;
  }

  return total;
}

int main(int argc, char **argv)
{
  if (argc > 1 && argv[1][0] == '2')
    println("{}", part2(cin));
  else
    println("{}", part1(cin));
  return 0;
}