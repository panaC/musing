#include <iostream>
#include <fstream>
#include <string>
#include <algorithm>
using namespace std;

int main() {

  ifstream file;
  string line;
  file.open("d6/input");
  int total_score = 0;
  int i = 0;


  // part2 is very easy just have to change the lookup size
  int lookupSize = 14;

  if (file.is_open()) {
    for (string line; getline(file, line, '\n'); ) {

      // one line for d6/part1

      // for (string::iterator it = line.begin() + 4; it != line.end(); it++) {
      for (; i < line.length() - lookupSize; i++) {

        auto s = line.substr(i, lookupSize);
        sort(s.begin(), s.end());
        auto last = unique(s.begin(), s.end());
        if (s.end() == last)
          break;

      }
    }

    file.close();
  } else {
    cout << "error to open the file" << endl;
  }

  cout << i + lookupSize << " character marker" << endl;

  return 0;
}

