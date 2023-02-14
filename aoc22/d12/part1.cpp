#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <utility>
using namespace std;

typedef std::pair<int, int> Pos;
typedef vector<vector<char>> Map;
typedef vector<vector<Pos>> Path;

static vector<Pos> rules(Pos pos, Pos end, vector<Pos> marked, std::pair<int, int> size, Map& map) {

    vector<Pos> list;

    if (pos.first >= size.first || pos.first < 0 || pos.second >= size.second || pos.second < 0) {
        cout << "Rules error POS is not correct !! " << pos.second << " . " << pos.first << endl;
        return list;
    }
    // if (pos.first == end.first && pos.second == end.second) {
    if (pos == end) {
        return list;
    }

    Pos r(pos.first + 1, pos.second);
    Pos l(pos.first - 1, pos.second);
    Pos u(pos.first, pos.second + 1);
    Pos d(pos.first, pos.second - 1);
    if (
        r.first < size.first &&
        map[r.second][r.first] <= map[pos.second][pos.first] + 1 &&
        find(marked.begin(), marked.end(), r) == marked.end())
    {
        list.push_back(r);
    }
    if (
        l.first >= 0 &&
        map[l.second][l.first] <= map[pos.second][pos.first] + 1 &&
        find(marked.begin(), marked.end(), l) == marked.end())
    {
        list.push_back(l);
    }
    if (
        u.second < size.second &&
        map[u.second][u.first] <= map[pos.second][pos.first] + 1 &&
        find(marked.begin(), marked.end(), u) == marked.end())
    {
        list.push_back(u);
    }
    if (
        d.second >= 0 &&
        map[d.second][d.first] <= map[pos.second][pos.first] + 1 &&
        find(marked.begin(), marked.end(), d) == marked.end())
    {
        list.push_back(d);
    }

    return list;    
}

static Pos seekStartPos(Map& map) {

    int x = 0, y = 0;
    for (auto &l : map) {
        for (auto &c : l) {
            if (c == 'S') {
                map[y][x] = 'a';
                return Pos(x,y);
            }
            x++;
        }
        x = 0;
        y++;
    }

    throw "no start position";
}
static Pos seekEndPos(Map& map) {

    int x = 0, y = 0;
    for (auto &l : map) {
        for (auto &c : l) {
            if (c == 'E') {
                map[y][x] = 'z';
                return Pos(x,y);
            }
            x++;
        }
        x = 0;
        y++;
    }

    throw "no end position";
}

static void dbgprint(Map map) {
  for (auto &l : map) {
    for (auto &ch : l) {
        cout << ch;
    }
    cout << endl;
  }
}

Path totalPath;

vector<Pos> bfs(Pos pos, Pos end, std::pair<int, int> size, Map& map, vector<Pos> currentPath) {

    // cout << "POS : " << pos.second << " " << pos.first << endl;

    // this is the end
    // if (pos.first == end.first && pos.second == end.second) {
    if (pos == end) {
        return currentPath;
    }

    vector<Pos> posList = rules(pos, end, currentPath, size, map);
    for (auto p : posList) {
        // cout << "RULES : p = " << p.second << " " << p.first << endl;
        vector<Pos> pathCopy(currentPath);
        pathCopy.push_back(p);
        vector<Pos> pathAfterBfs = bfs(p, end, size, map, pathCopy);
        if (pathAfterBfs.size()) {
            totalPath.push_back(pathAfterBfs);
            std::sort(totalPath.begin(), totalPath.end(), [](auto &a, auto &b) -> bool
                      { return a.size() < b.size(); });
            cout << "Length : " << totalPath[0].size() - 1 << endl;
        }
    }

    return {};
}

int main() {

  ifstream file;
  string line;
  file.open("d12/input");
  Map map;

  if (file.is_open()) {
    for (string line; getline(file, line, '\n'); ) {

        vector<char> l;
        for (char &ch : line) {
            l.push_back(ch);
        }

        map.push_back(l);
    }

    file.close();
  } else {
    cout << "error to open the file" << endl;
  }

    //dbgprint(map);

    Pos start = seekStartPos(map);
    cout << "start position (x,y) : " << start.first << " " << start.second << endl;

    Pos end = seekEndPos(map);
    cout << "end position (x,y) : " << end.first << " " << end.second << endl;

    std::pair<int, int> size(map[0].size(), map.size());
    cout << "map size : (x,y) : " << size.second << " " << size.first << endl;

    bfs(start, end, size, map, vector<Pos>({Pos(start)}));

    cout << "totalPath size = " << totalPath.size() << endl; 
    for (auto &v : totalPath) {
        for (auto &p : v) {
            cout << "(" << p.first << "," << p.second << ")";
        }
        cout << endl;
    }

    std::sort(totalPath.begin(), totalPath.end(), [](auto &a, auto &b) -> bool {
        return a.size() < b.size();
    });

    cout << "Path : " << endl;
    for (auto &p : totalPath[0]) {
        cout << "(" << p.first << "," << p.second << ")";
    }
    cout << endl;

    // minus one because end or start not counted
    cout << "Length : " << totalPath[0].size() -1  << endl;


  return 0;
}

