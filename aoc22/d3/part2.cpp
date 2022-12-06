#include <iostream>
#include <fstream>
#include <string>
#include <set>
#include <vector>
#include <algorithm>

using namespace std;

int main() {

  ifstream file;
  string line;
  file.open("d3/input");
  int total_score = 0;

  int subgroup = 0;


	// I try in the beggining with set and vector but string works also
  // vector<char> subset[3];
	string subline[3];


  if (file.is_open()) {
    for (string line; getline(file, line, '\n'); ) {

      // copy(line.begin(), line.end(), back_inserter(subset[subgroup++]));
			subline[subgroup++] = string(line);
      if (subgroup == 3) {

        for (auto& letter : subline[0])
          cout << letter << ' ';
        cout << endl;
        for (auto& letter : subline[1])
          cout << letter << ' ';
        cout << endl;
        for (auto& letter : subline[2])
          cout << letter << ' ';
        cout << endl;

        string s_inter_tmp;
				string s_inter;

				// sorting is important here. intersection on set doesn't works instead
				sort(subline[0].begin(), subline[0].end());
				sort(subline[1].begin(), subline[1].end());
				sort(subline[2].begin(), subline[2].end());

        set_intersection(subline[0].begin(), subline[0].end(), subline[1].begin(), subline[1].end(), back_inserter(s_inter_tmp));
        cout << s_inter_tmp << endl;
				set_intersection(s_inter_tmp.begin(), s_inter_tmp.end(), subline[2].begin(), subline[2].end(), back_inserter(s_inter));
        cout << s_inter << endl;

        subgroup = 0;

        subset[0] = {};
        subset[1] = {};
        subset[2] = {};

				char letter = s_inter[0];

				if (letter - 'a' < 0)
					total_score += letter - 'A' + 27;
				else
					total_score += letter - 'a' + 1;

      }
    }

    file.close();
  } else {
    cout << "error to open the file" << endl;
  }

  cout << total_score << " sum of the priorites" << endl;

  return 0;
}

