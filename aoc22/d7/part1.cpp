#include <iostream>
#include <fstream>
#include <string>
#include <algorithm>
#include <vector>
#include <cassert>
using namespace std;

// make_shared<Leaf>();

struct Leaf {
  shared_ptr<Leaf> parent;
  vector<shared_ptr<Leaf>> dir;
  int size;
  int isDir;
  string name;
};

auto create_leaf(string name, shared_ptr<Leaf> parent, int size = 0, int isDir = false) {

  auto l = make_shared<Leaf>();
  l->name = name;
  l->size = size;
  l->dir = vector<shared_ptr<Leaf>>();
  l->isDir = isDir;
  l->parent = parent;

  return l;
}

void print_tree(shared_ptr<Leaf> l, int level) {
  cout << string(level, ' ') << "- " << l->name;
  if (l->isDir)
    cout << " (Dir)";
  else
    cout << " (file, size="<< l->size << ")";
  cout << endl;
  for (auto v : l->dir) {
    print_tree(v, level+1);
  }
}

int __totalsum = 0;

int dfs(shared_ptr<Leaf> l, int under = 100000) {

  if (l->isDir) {

    int dirsize = 0;
    for (auto v : l->dir) {
        dirsize += dfs(v);
    }

    if (dirsize <= under)
      __totalsum += dirsize;

    return dirsize;

  } else {
    return l->size;
  }
}

int main() {

  ifstream file;
  string line;
  file.open("d7/input");
  int total_score = 0;

  auto root = create_leaf("/", nullptr, 0, true);
  shared_ptr<Leaf> leafPtr = root;


  if (file.is_open()) {
    for (string line; getline(file, line, '\n'); ) {

      cout << line << endl;

      if (line[0] == '$') {

        if (line[2] == 'c' && line[3] == 'd') {

          string path = line.substr(5);
          if (path == "/") {
            leafPtr = root;
          } else if (path == "..") {
            if (leafPtr->parent != nullptr)
              leafPtr = leafPtr->parent;
            else
              assert(0);
          } else {

            // assign leafPtr to the leaf with the right name from leafPtr->dir
            // 1. find the path from leaf->name
            // 2. assign leafPtr with the leaf

            for (auto& v : leafPtr->dir) {
              if (v->name == path)
                leafPtr = v;
            }
          }

        }
        continue;
      }

      // stdout
     
      if (line[0] == 'd') {

        string name = line.substr(4);
        auto newLeaf = create_leaf(name, leafPtr, 0, true);
        leafPtr->dir.push_back(newLeaf);
        continue;
      }

      int size = stoi(line);
      string name = line.substr(line.find(' ') + 1);
      auto newLeaf = create_leaf(name, leafPtr, size, false);
      leafPtr->dir.push_back(newLeaf);

    }

    file.close();
  } else {
    cout << "error to open the file" << endl;
  }

  print_tree(root, 0);


  // dfs
  //
  cout << dfs(root) << " " <<  __totalsum << endl;
  

  return 0;
}

