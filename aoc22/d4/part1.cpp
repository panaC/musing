#include <iostream>
#include <fstream>
#include <string>
using namespace std;

int main() {

  ifstream file;
  string line;
  file.open("d4/input");
  int total_score = 0;

  if (file.is_open()) {
    for (string line; getline(file, line, '\n'); ) {

      size_t delimiter = line.find(",");
      string s1 = line.substr(0, delimiter);
      string s2 = line.substr(delimiter + 1);

      size_t delimiter_hyphen_s1 = s1.find("-");
      size_t delimiter_hyphen_s2 = s2.find("-");

      int l1 = stoi(s1.substr(0, delimiter_hyphen_s1));
      int l2 = stoi(s1.substr(delimiter_hyphen_s1 + 1));
      int r1 = stoi(s2.substr(0, delimiter_hyphen_s2));
      int r2 = stoi(s2.substr(delimiter_hyphen_s2 + 1));

      int score = l1 < r1 ? l2 >= r2 : (l1 > r1 ? l2 <= r2 : (l1 == r1 || l2 == r2));

      cout << l1 << '-' << l2 << ',' << r1 << '-' << r2 << " > " << score << endl;

      total_score += score;


    }

    file.close();
  } else {
    cout << "error to open the file" << endl;
  }

  cout << total_score << " sums" << endl;

  return 0;
}

