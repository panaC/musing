#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int main() {

  ifstream file;
  string line;
  file.open("d8/input");
  vector<int> map;
  int size = 0;
  int ptr = 0;
  int tree = 0;

  vector<int> treeMarked;

  if (file.is_open()) {
    for (string line; getline(file, line, '\n'); ) {

      size = line.size();
      for (auto c : line) {

        map.push_back(stoi(string(1, c)));
      }
    }

    cout << size << endl;
    for (auto v : map) {
      cout << v << ",";
    }
    cout << endl;

    tree = size * 4 - 4; // visible from edge
    
    for (int n = 1; n < size - 1; n++) {

      cout << n << endl;

      int t = 0;
      int d = 0;
      int r = 0;
      int l = 0;

      // top-down
      ptr = size + n; // start at 6 for test
      while (
          // find(treeMarked.begin(), treeMarked.end(), ptr) == treeMarked.end() &&
          // map[ptr] >= map[ptr - size] &&
          ptr < map.size() - size // minus edge
          ) {
        if (map[ptr] > map[ptr - size] && map[ptr] > t && find(treeMarked.begin(), treeMarked.end(), ptr) == treeMarked.end()) {
          t = map[ptr];
          treeMarked.push_back(ptr);
        }
        ptr += size;
      }

      // down-top
      ptr = map.size() - 2 * size + n; // start at 16 for test
      while (
          // find(treeMarked.begin(), treeMarked.end(), ptr) == treeMarked.end() &&
          // map[ptr] >= map[ptr + size] &&
          ptr > size// minus edge
          ) {
        if (map[ptr] > map[ptr + size] && map[ptr] > d && find(treeMarked.begin(), treeMarked.end(), ptr) == treeMarked.end()) {
          d = map[ptr];
          treeMarked.push_back(ptr);
        }
        ptr -= size;
      }

      // right-left
      ptr = n * size + 1; // start at 6 for test
      while (
          // find(treeMarked.begin(), treeMarked.end(), ptr) == treeMarked.end() &&
          // map[ptr] >= map[ptr - 1] &&
          ptr % size < size - 1 // minus one edge
          ) {
        if (map[ptr] > map[ptr - 1] && map[ptr] > r && find(treeMarked.begin(), treeMarked.end(), ptr) == treeMarked.end()) {
          r = map[ptr];
          treeMarked.push_back(ptr);
        }
        ptr += 1;
      }

      // left-right
      ptr = n * size + size - 2; // start at 8 for test
      while (
          // find(treeMarked.begin(), treeMarked.end(), ptr) == treeMarked.end() &&
          // map[ptr] >= map[ptr + 1] &&
          ptr % size > 0
          ) {
        if (map[ptr] > map[ptr + 1] && map[ptr] > l && find(treeMarked.begin(), treeMarked.end(), ptr) == treeMarked.end()) {
          l = map[ptr];
          treeMarked.push_back(ptr);
        }
        ptr -= 1;
      }
    }

    file.close();
  } else {
    cout << "error to open the file" << endl;
  }

  tree += treeMarked.size();

  sort(treeMarked.begin(), treeMarked.end());

  cout << "marked : ";
  for (auto c : treeMarked)
    cout << c << ",";
  cout << endl;

  int fooptr = 0;
  for (int i = 1; i <= size * size; i++) {

    if (treeMarked[fooptr] == i - 1) {
      cout << "1";
      fooptr++;
    } else 
      cout << "0";
    if (i % size == 0)
      cout << endl;
  }
  cout << endl;

  cout << tree << " tree number" << endl;

  return 0;
}

