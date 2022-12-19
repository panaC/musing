#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <algorithm>
#include <numeric>
using namespace std;

int main() {

  ifstream file;
  string line;
  file.open("d8/input");

  int max = 0;
  vector<vector<int>> treemap;
  int size = 0;


  if (file.is_open()) {
    for (string line; getline(file, line, '\n'); ) {

      size = line.length();

      vector<int> v;

      for (auto a : line)
        v.push_back(stoi(string(1, a)));

      treemap.push_back(v);

    }

    vector<vector<int>> treemarked(size, vector(size, 0));

    for (int d = 0; d < size; d++) {
      for (int v = 0; v < size; v++) {

        int l = 0, r = 0, t = 0, b = 0;

        for (int j = v - 1; j >= 0; j--) {
          if (treemap[d][j] < treemap[d][v]) {
            l += 1;
          } else {
            l += 1;
            break;
          }
        }
        for (int j = v + 1; j < size; j++) {
          if (treemap[d][j] < treemap[d][v]) {
            r += 1;
          } else {
            r += 1;
            break;
          }
        }
        for (int j = d - 1; j >= 0; j--) {
          if (treemap[j][v] < treemap[d][v]) {
            t += 1;
          } else {
            t += 1;
            break;
          }
        }
        for (int j = d + 1; j < size; j++) {
          if (treemap[j][v] < treemap[d][v]) {
            b += 1;
          } else {
            b += 1;
            break;
          }
        }
        treemarked[d][v] = l * r * t * b;
      }
    }

    for (auto a : treemap) {
      for (auto b : a) {
        cout << b ;
      }
      cout << endl;
    }
    cout << endl;
    for (auto a : treemarked) {
      for (auto b : a) {
        cout << b ;
      }
      cout << endl;
    }

    for (auto a : treemarked) {
      for (auto b : a) {
        max = b > max ? b : max;
      }
    }
    cout << endl;

    file.close();
  } else {
    cout << "error to open the file" << endl;
  }

  cout << max << " highest scenic score" << endl;

  return 0;
}

