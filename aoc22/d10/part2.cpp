#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <algorithm>
#include <numeric>
#include <utility>
#include <set>
#include <vector>
using namespace std;


/**
 * 
 * line of 40 cycles
 * 6 * 40 pixels
 * 0 -> 240 cycles
 * 
 * sprite 3 pixels on the middle of the x registers
 * x = 5 -> sprite = 4 à 6
 * 
*/

void draw(int &cycle, int &x) {
  static int pos = 0;
  if (pos >= x - 1 && pos <= x + 1)
    cout << "#";
  else
    cout << ".";
  if (cycle % 40 == 0) {
    pos = 0;
    cout << endl;
  } else {
    ++pos;
  }
}

int main()
{

  ifstream file;
  string line;
  file.open("d10/input");
  int cycle = 0;
  int x = 1;
  int strengths = 0;

  if (file.is_open()) {
    for (string line; getline(file, line, '\n'); ) {

      istringstream iss{line};
      string opcode;
      int value;
      iss >> opcode >> value;

      int intern_cycle = 0;
      if (opcode == "addx") {
        intern_cycle = 2;
      } else if (opcode == "noop") {
        intern_cycle = 1;
      }

      while (intern_cycle > 1) {
        intern_cycle--;
        cycle++;

        draw(cycle, x);
      }

      intern_cycle--;
      cycle++;

      draw(cycle, x);
      if (opcode == "addx") {
        x += value;
        // cout << cycle << " : " << x << endl;
      }
    }

    file.close();
  } else {
    cout << "error to open the file" << endl;
  }

  return 0;
}
