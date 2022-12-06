#include <iostream>
#include <fstream>
#include <string>
using namespace std;


// A , X = Rock = 1
// B , Y = Paper = 2
// C , Z = Scissors = 3
// 0 if lost
// 3 if draw
// 6 if won


// A X / B Y / C Z = Draw
// A Z / B X / C Y = Lost
// A Y / B Z / C X = Won


int main() {

  ifstream file;
  string line;
  file.open("d2/input");
  int total_score = 0;

  if (file.is_open()) {
    for (string line; getline(file, line, '\n'); ) {

      int score = line[2] - 'X' + 1;
      int draw = line == "A X" || line == "B Y" || line == "C Z";
      // int lost = line == "A Z" || line == "B X" || line == "C Y";
      int won = line == "A Y" || line == "B Z" || line == "C X";

      score += draw * 3 + won * 6;
      total_score += score;

    }

    file.close();
  } else {
    cout << "error to open the file" << endl;
  }

  cout << total_score << " Total score" << endl;

  return 0;
}

