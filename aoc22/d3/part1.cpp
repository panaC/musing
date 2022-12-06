#include <iostream>
#include <fstream>
#include <string>
using namespace std;

int main() {

  ifstream file;
  string line;
  file.open("d3/input");
  int total_score = 0;

  if (file.is_open()) {
    for (string line; getline(file, line, '\n'); ) {

      string subline = line.substr(line.length() / 2); // get from pos to end of string

      size_t found = line.find_first_of(subline);
      if (found == string::npos)
        continue;

      char letter = line[found];

      if (letter - 'a' < 0)
        total_score += letter - 'A' + 27;
      else
        total_score += letter - 'a' + 1;

    }

    file.close();
  } else {
    cout << "error to open the file" << endl;
  }

  cout << total_score << " sum of the priorites" << endl;

  return 0;
}

