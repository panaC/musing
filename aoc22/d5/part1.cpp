#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <stack>
#include <regex>

using namespace std;

// TODO move to a local variable with ptr
stack<char> __crates[10];


void crates_parsing(vector<string>& crates) {

  const int padding = 4;
  const int start = 1;

  for (auto it = crates.rbegin(); it != crates.rend(); it++) {

    string s = *it;
    // cout << "S='" << s << "'" <<  endl;

    int i = start;

    // [Z] [M] [P]
    //  1   5   9
    //  0   1   2
    while (s.length() > i) {

      // cout << "w " << i << " " << (i - start) / padding << " '" << s[i] << "'" <<  endl;
      if (s[i] != ' ')
        __crates[(i - start) / padding].push(s[i]);
      i += padding;
    }
  }
}

int main() {

  ifstream file;
  string line;
  file.open("d5/input");
  int total_score = 0;
  vector<string> cratesNotParsed;
  const int parsing = 0;
  const int procedure = 1;
  int state = parsing;

  if (file.is_open()) {
    for (string line; getline(file, line, '\n'); ) {

      if (state == parsing) {

        if (line.empty()) {

          cratesNotParsed.pop_back(); // remove 1 2 3 4 // last line

          // start the crates parsing
          crates_parsing(cratesNotParsed);

          state = procedure;
          continue; 
        }

        cratesNotParsed.push_back(line);

        continue;
      }

      // procedure
      
      regex e("move ([0-9]*) from ([0-9]*) to ([0-9]*)");
      
      // becareful
      // cmatch is char* smatch is string !!
      smatch sm;
      regex_match(line, sm, e);

      if (sm.size() != 4) {
        return -1;
      }

      // becarefull sm[0] contains the matched string
      int moveSize = stoi(sm[1]);
      int moveFrom = stoi(sm[2]);
      int moveTo = stoi(sm[3]);

      for (int i = 0; i < moveSize; i++) {
        if (__crates[moveFrom - 1].empty())
          break;
        __crates[moveTo - 1].push(__crates[moveFrom - 1].top());
        __crates[moveFrom - 1].pop();

      }

    }

    file.close();
  } else {
    cout << "error to open the file" << endl;
  }

  cout << "message : ";

  for (int i = 0; i < 10; i++) {

    if (__crates[i].empty()) continue;

    cout << __crates[i].top();
  }
  cout << endl;

  return 0;
}

