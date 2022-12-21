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

constexpr int check_cycle(int& cycle, int& x) {
  if ((cycle == 20 || (cycle - 20) % 40 == 0) && cycle <= 220) {
    // cout << cycle << " : " << x << " :: " << cycle * x <<  endl;
    return cycle * x;
  }
  return 0;
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

        strengths += check_cycle(cycle, x);
      }

      intern_cycle--;
      cycle++;

      /**
       *
       * At the start of the fourth cycle, the addx -5 instruction begins execution. During the fourth cycle, X is still 4.
      During the fifth cycle, X is still 4. After the fifth cycle, the addx -5 instruction finishes execution, setting X to -1.
      */
      strengths += check_cycle(cycle, x);
      if (opcode == "addx") {
        x += value;
        // cout << cycle << " : " << x << endl;
      }
    }

    file.close();
  } else {
    cout << "error to open the file" << endl;
  }

  cout << strengths << " strengths" << endl;

  return 0;
}
