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

// thanks to https://github.com/tbeu/AdventOfCode/blob/master/2022/day09/day09.cpp

int main() {

  ifstream file;
  string line;
  file.open("d9/input");
  set<pair<int, int>> tail;

  tail.insert(make_pair(0, 0));
  int xh = 0, yh = 0, oldxh = 0, oldyh = 0, xt = 0, yt = 0;

  if (file.is_open()) {
    for (string line; getline(file, line, '\n'); ) {

      // terrible bug
      // je n'avais pas prévu que move soit plus grand que 9 one char
      // mais pourquoi !? 

      // ne plus utiliser stoi et substr, ... mais plutôt utiliser isstringstream
      // cast implicit !
      istringstream iss{line};
      char dir;
      int move;
      iss >> dir >> move;

      for (int i = 0; i < move; i++) {

        // keep oldh
        oldxh = xh;
        oldyh = yh;

        // set the new head
        if (dir == 'R')
          xh++;
        if (dir == 'U')
          yh++;
        if (dir == 'L')
          xh--;
        if (dir == 'D')
          yh--;

        // set tail if too far
        int dx = xh - xt;
        int dy = yh - yt;
        if (abs(dx) > 1 || abs(dy) > 1) {
          // move the tail
          xt = oldxh;
          yt = oldyh;

          // le signe ici n'est pas le plus important car je garde une trace 
          // de l'ancienne position de head
          // donc la position est toujours bonne
          // si je devais l'incrémenter alors là le signe est important
          //
          // donc j'avais bon depuis le début juste une mauvaise appréciationn de la différence entre input et test
          // xt += (0 < dx) - (dx < 0);
          // yt += (0 < dy) - (dy < 0);
          tail.insert(make_pair(xt, yt));
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

