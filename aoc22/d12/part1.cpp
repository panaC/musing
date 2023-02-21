#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <set>
#include <queue>
#include <map>
#include <utility>
#include <algorithm>

using namespace std;

typedef std::pair<int, int> Pos;
typedef std::pair<int, int> Size;
typedef vector<vector<char>> Map;
typedef vector<vector<Pos>> Path;
typedef struct leaf {
    Pos pos;
    vector<Pos> childPos;
} Leaf;
typedef struct tree {
    Pos pos;
    vector<struct tree> child;
} Tree;
typedef map<Pos, vector<Pos>> TreeMap;

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

static vector<Pos> findChild(Pos pos, Size size, Map& map) {

    vector<Pos> list;

    if (pos.first >= size.first || pos.first < 0 || pos.second >= size.second || pos.second < 0) {
        cout << "Rules error POS is not correct !! " << pos.second << " . " << pos.first << endl;
        return {};
    }

    Pos r(pos.first + 1, pos.second);
    Pos l(pos.first - 1, pos.second);
    Pos u(pos.first, pos.second + 1);
    Pos d(pos.first, pos.second - 1);

    if (
        r.first < size.first &&
        map[r.second][r.first] <= map[pos.second][pos.first] + 1)
    {
        list.push_back(r);
    }
    if (
        l.first >= 0 &&
        map[l.second][l.first] <= map[pos.second][pos.first] + 1)
    {
        list.push_back(l);
    }
    if (
        u.second < size.second &&
        map[u.second][u.first] <= map[pos.second][pos.first] + 1)
    {
        list.push_back(u);
    }
    if (
        d.second >= 0 &&
        map[d.second][d.first] <= map[pos.second][pos.first] + 1)
    {
        list.push_back(d);
    }

    // for (auto &v : list) {
    //     cout << v.first << " " << v.second << ", ";
    // }
    // cout << endl;

    return list;    
}

static int manhattan(Pos a, Pos b) {
    return abs(b.first - a.first) + abs(b.second - a.second);
}

vector<Leaf> bfs(Pos root, /*Pos goal,*/ Size mapSize, Map& map) {

    std::set<Pos> visited;
    std::queue<Pos> pile;
    std::vector<Leaf> leafs;

    // 1. Add root node to the queue, and mark it as visited(already explored).
    pile.push(root);
    visited.insert(root);

    // 2. Loop on the queue as long as it's not empty.
    while (pile.size()) {

        // 2.1. Get and remove the node at the top of the queue(current).
        const auto pos = pile.front();
        pile.pop();

        Leaf leaf = {.pos = pos, .childPos = vector<Pos>()};

        // 2.2. For every non-visited child of the current node, do the following:
        auto child = findChild(pos, mapSize, map);


        #ifdef DEBUG_BFS
        cout << " child > ";
        for (auto &v : child)
        {
        cout << v.first << " " << v.second << ", ";
        }
        cout << endl;
        cout << " visit > ";
        for (auto &v : visited)
        {
        cout << v.first << " " << v.second << ", ";
        }
        cout << endl;
        #endif

        std::vector<Pos> childIntersection;
        std::vector<Pos> childFiltered;

        sort(child.begin(), child.end());
        std::set_intersection(child.begin(), child.end(), visited.begin(), visited.end(), std::inserter(childIntersection, childIntersection.begin()));
        std::set_difference(child.begin(), child.end(), childIntersection.begin(), childIntersection.end(), std::inserter(childFiltered, childFiltered.begin()));

        #ifdef DEBUG_BFS
        cout << " filte > ";
        for (auto &v : childFiltered)
        {
        cout << v.first << " " << v.second << ", ";
        }
        cout << endl;
        #endif

        for (auto childPos : childFiltered) {

            // 2.2. 1. Mark it as visited.
            visited.insert(childPos);

            // 2.2.2. Check if it's the goal node, If so, then return it.
            // . -> goal in the first time is not checked

            // 2.2.3. Otherwise, push it to the queue.
            pile.push(childPos);

            // add it to the tree
            leaf.childPos.push_back(childPos);
        }

        // add leaf in the leafs vector array
        leafs.push_back(leaf);
    }

    // 3. If queue is empty, then goal node was not found!
    // -> goal not checked, we discover all the map

    return leafs;
}

Tree leafsToTree(Tree tree, vector<Leaf>& leafs) {

    auto it = find_if(leafs.begin(), leafs.end(), [&tree](leaf &a)
                   { return a.pos == tree.pos; });
    if (it == leafs.end()) {
        return tree;
    }
    auto leaf = *it;
    for (auto l : leaf.childPos) {
        Tree treeChild = {.pos = l, .child = vector<Tree>()};
        tree.child.push_back(leafsToTree(treeChild, leafs));
    }

    return tree;
}

TreeMap leafsToTreeMap(vector<Leaf>& leafs) {

    TreeMap treeMap;

    for (auto& v : leafs) {
        treeMap.insert_or_assign(v.pos, v.childPos);
    }
    return treeMap;
}

vector<Pos> bfs_pathfinding(TreeMap& tree, Pos start, Pos goal) {
    
    std::queue<Pos> pile;
    std::set<Pos> visited;
    std::map<Pos, vector<Pos>> paths;

    pile.push(start);
    visited.insert(start);
    paths.insert_or_assign(start, vector{start});

    while(pile.size()) {
        const auto pos = pile.front();
        pile.pop();

        for (auto& child : tree.at(pos)) {
            if (find(visited.begin(), visited.end(), pos) != visited.end()) {

                visited.insert(child);

                vector<Pos> copy(paths.at(pos).begin(), paths.at(pos).end());
                copy.push_back(child);
                paths.insert_or_assign(child, copy);

                if (child == goal) { 
                    cout << "found" << endl;
                } else {
                    pile.push(child);
                }

            }
        }
        paths.erase(pos);
    }

    return paths.at(goal);
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

    dbgprint(map);

    Pos start = seekStartPos(map);
    cout << "start position (x,y) : " << start.first << " " << start.second << endl;

    Pos end = seekEndPos(map);
    cout << "end position (x,y) : " << end.first << " " << end.second << endl;

    std::pair<int, int> size(map[0].size(), map.size());
    cout << "map size : (x,y) : " << size.first << " " << size.second << endl;

    auto leafs = bfs(start, /*end,*/ size, map);

    Tree tree = {.pos = start, .child = vector<Tree>()};
    tree = leafsToTree(tree, leafs);

    TreeMap treeMap = leafsToTreeMap(leafs);    

    vector<Pos> path = bfs_pathfinding(treeMap, start, end);
    cout << "Length : " << path.size() - 1 << endl;

    return 0;
}

