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

  int tree = 0;
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
    int l = 0, r = 0, t = 0, b = 0;

    // left-right
    for (int i = 0; i < size; i++) {
      treemarked[i][0] = 1; // left side
      treemarked[i][size - 1] = 1; // right side 
      treemarked[0][i] = 1; // top side 
      treemarked[size - 1][i] = 1; // bottom side 

      l = treemap[i][0];
      for (int j = 1; j < size; j++) {
        if (treemap[i][j] > l) {
          l = treemap[i][j];
          treemarked[i][j] = 1;
        }
      }
      r = treemap[i][size - 1];
      for (int j = size - 1; j >= 0; j--) {
        if (treemap[i][j] > r) {
          r = treemap[i][j];
          treemarked[i][j] = 1;
        }
      }
    }
    // top-bottom
    for (int i = 0; i < size; i++) {

      t = treemap[0][i];
      for (int j = 1; j < size; j++) {
        if (treemap[j][i] > t) {
          t = treemap[j][i];
          treemarked[j][i] = 1;
        }
      }
      b = treemap[size - 1][i];
      for (int j = size - 1; j >= 0; j--) {
        if (treemap[j][i] > b) {
          b = treemap[j][i];
          treemarked[j][i] = 1;
        }
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
      tree = accumulate(a.begin(), a.end(), tree);
    }
    cout << endl;

    file.close();
  } else {
    cout << "error to open the file" << endl;
  }

  cout << tree << " tree number" << endl;

  return 0;
}

