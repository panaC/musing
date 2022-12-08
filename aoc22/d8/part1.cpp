#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int main() {

  ifstream file;
  string line;
  file.open("d8/test2");
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

    tree += size * 4 - 4; // visible from edge
    
    for (int n = 1; n < size - 1; n++) {

      cout << n << endl;

      // top-down
      ptr = size + n; // start at 6 for test
      while (
          find(treeMarked.begin(), treeMarked.end(), ptr) == treeMarked.end() &&
          map[ptr] >= map[ptr - size] &&
          ptr < map.size() - size // minus edge
          ) {
        cout << "top-down" << ptr << endl;
        if (map[ptr] > map[ptr - size])
          treeMarked.push_back(ptr);
        ptr += size;
      }

      // down-top
      ptr = map.size() - 2 * size + n; // start at 16 for test
      while (
          find(treeMarked.begin(), treeMarked.end(), ptr) == treeMarked.end() &&
          map[ptr] >= map[ptr + size] &&
          ptr > size// minus edge
          ) {
        cout << "down-top" << ptr << endl;
        if (map[ptr] > map[ptr + size])
          treeMarked.push_back(ptr);
        ptr -= size;
      }

      // right-left
      ptr = n * size + 1; // start at 6 for test
      while (
          find(treeMarked.begin(), treeMarked.end(), ptr) == treeMarked.end() &&
          map[ptr] >= map[ptr - 1] &&
          ptr % size < size - 1 // minus one edge
          ) {
        cout << "right-left" << ptr << endl;
        if (map[ptr] > map[ptr - 1])
          treeMarked.push_back(ptr);
        ptr += 1;
      }

      // left-right
      ptr = n * size + size - 2; // start at 8 for test
      while (
          find(treeMarked.begin(), treeMarked.end(), ptr) == treeMarked.end() &&
          map[ptr] >= map[ptr + 1] && // mon truc est peté doit etre superieur ou egal et check que p et p+1 ne sont pas égaux
          ptr % size > 0
          ) {
        cout << "left-right" << ptr << endl;
        if (map[ptr] > map[ptr + 1])
          treeMarked.push_back(ptr);
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

  cout << tree << " tree number" << endl;

  return 0;
}

