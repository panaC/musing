#include <iostream>
#include <fstream>
#include <string>
using namespace std;


// A  = Rock = 1
// B  = Paper = 2
// C  = Scissors = 3
// 0 if lost
// 3 if draw
// 6 if won
// X = loose
// Y = draw
// Z = win

// A X / B Y / C Z = Draw
// A Z / B X / C Y = Lost
// A Y / B Z / C X = Won
//
//
// A Y
// B X
// C Z
//
// A A / B B / C C = Draw
// A C / B A / C B = Lost
// A B / B C / C A = Won


int t[3][3] = {
  {3, 1, 2}, // Loose
  {1, 2, 3}, // Draw
  {2, 3, 1}, // win
};


int main() {

  ifstream file;
  string line;
  file.open("d2/input");
  int total_score = 0;

  if (file.is_open()) {
    for (string line; getline(file, line, '\n'); ) {

      int status = line[2] - 'X';
      total_score += t[status][line[0] - 'A'] + status * 3;

    }

    file.close();
  } else {
    cout << "error to open the file" << endl;
  }

  cout << total_score << " Total score" << endl;

  return 0;
}

