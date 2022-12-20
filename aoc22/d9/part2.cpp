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

int main() {

  ifstream file;
  string line;
  file.open("d9/input");
  set<pair<int, int>> tail;

  tail.insert(make_pair(0, 0));
  vector<pair<int, int>> knots(10, {0, 0});

  if (file.is_open()) {
    for (string line; getline(file, line, '\n'); ) {

      istringstream iss{line};
      char dir;
      int move;
      iss >> dir >> move;

      for (int i = 0; i < move; i++) {

        // set the new head
        if (dir == 'R')
          knots[0].first++;
        if (dir == 'U')
          knots[0].second++;
        if (dir == 'L')
          knots[0].first--;
        if (dir == 'D')
          knots[0].second--;

        for (auto it = knots.begin() + 1; it != knots.end(); it++) {
          // set tail if too far
          auto h = (it-1);
          auto t = it;
          int dx = h->first - t->first;
          int dy = h->second - t->second;
          if (abs(dx) > 1 || abs(dy) > 1) {
            // move the tail

            t->first += (0 < dx) - (dx < 0);
            t->second += (0 < dy) - (dy < 0);

            if (it + 1 == knots.end())
              tail.insert(make_pair(t->first, t->second));
          }
        }
      }

    }

    int maxx = 0, maxy = 0;
    for (auto a : tail) {

      int x = get<0>(a);
      int y = get<1>(a);

      if (x > maxx)
        maxx = x;
      if (y > maxy)
        maxy = y;

      cout << x << " " << y << endl;
    }
    cout << endl;

    // // vector<vector<char>> tab(maxy + 1, vector(maxx + 1, '.'));
    // vector<vector<char>> tab(maxy + 1, vector(maxx + 1, '.'));

    // for (auto& a : tail) {

    //   int x = get<0>(a);
    //   int y = get<1>(a);

    //   tab[maxy - y][x] = '#';

    // }

    // for (auto& a : tab) {
    //   for (auto& b : a) {
    //     cout << b;
    //   }
    //   cout << endl;
    // }
    // cout << endl;



    file.close();
  } else {
    cout << "error to open the file" << endl;
  }

  cout << tail.size() << " positions the tail visited at least once" << endl;

  return 0;
}

