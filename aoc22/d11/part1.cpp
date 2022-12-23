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

struct Op {
  int lvalue;
  int rvalue;
  bool lvalueIsOld;
  bool rvalueIsOld;
  char op;
};

struct Monkeys {
  Monkeys() {
    this->idx = 0;
  }
  int idx;
  vector<int> items;
  Op operation;
  int testDivisibleBy;
  int testTrue;
  int testFalse;
};


/*
https://stackoverflow.com/questions/2880903/simple-string-parsing-with-c

int main()
{
    std::ifstream file( "sample.txt" );

    std::string line;
    while( std::getline( file, line ) )   
    {
        std::istringstream iss( line );

        std::string result;
        if( std::getline( iss, result , '=') )
        {
            if( result == "foo" )
            {
                std::string token;
                while( std::getline( iss, token, ',' ) )
                {
                    std::cout << token << std::endl;
                }
            }
            if( result == "bar" )
            {
               //...
    }
}

*/

vector<Monkeys> parsing(ifstream &file) {
  string line;
  int linestate = 1;
  Monkeys monkey;
  int midx = 0;
  vector<Monkeys> vec_monkeys;


  while (getline(file, line)) {
    if (line.empty()) {
      linestate = 1;
      vec_monkeys.push_back(monkey);
      monkey = Monkeys();
      monkey.idx = ++midx;
      continue;
    }

    stringstream ss(line);
    if (linestate == 1) {
      string tmp;
      while (getline(ss, tmp, ' ')) {
        monkey.items.push_back(stoi(tmp));
      }
    }
    if (linestate == 2) {
      string lv, rv;
      int lvi, rvi;
      char op;

      ss >> lv >> op >> rv;

      if (lv == "old") {
        monkey.operation.lvalueIsOld = true;
      } else {
        monkey.operation.lvalueIsOld = false;
        monkey.operation.lvalue = stoi(lv);
      }
      if (rv == "old") {
        monkey.operation.rvalueIsOld = true;
      }
      else {
        monkey.operation.rvalueIsOld = false;
        monkey.operation.rvalue = stoi(rv);
      }
      monkey.operation.op = op;
    }
    if (linestate == 3) {
      int v;
      ss >> v;
      monkey.testDivisibleBy = (v);
    }
    if (linestate == 4) {
      int v;
      ss >> v;
      monkey.testTrue = v;
    }
    if (linestate == 5)
    {
      int v;
      ss >> v;
      monkey.testFalse = v;
    }

    linestate++;
  }
  return vec_monkeys;
}

int main()
{
  ifstream file("d11/inputparsed");
  vector<Monkeys> vec_monkeys = parsing(file);
  vector<int> inspectItems(vec_monkeys.size(), 0);

  for (int i = 0; i < 20; i++) {
    for (auto& monkey : vec_monkeys) {
      inspectItems[monkey.idx] += monkey.items.size();
      while (monkey.items.size()) {
        auto worrylvl = monkey.items.back();
        monkey.items.pop_back();

        const int newworrylvlTime = (monkey.operation.lvalueIsOld ? worrylvl : monkey.operation.lvalue) * 
        (monkey.operation.rvalueIsOld ? worrylvl : monkey.operation.rvalue);
        const int newworrylvlPlus = (monkey.operation.lvalueIsOld ? worrylvl : monkey.operation.lvalue) + 
        (monkey.operation.rvalueIsOld ? worrylvl : monkey.operation.rvalue);

        const int newlvl = monkey.operation.op == '*' ? newworrylvlTime : newworrylvlPlus;
        const int boredlvl = newlvl / 3;
        const int isItDivible = boredlvl % monkey.testDivisibleBy == 0;
        const int thrownto = isItDivible ? monkey.testTrue : monkey.testFalse;

        // here we should insert the new element to the thrownto idx
        // and remove the item from the initial vector
        // instead of used for auto : we need iterators
        vec_monkeys[thrownto].items.push_back(boredlvl);

        // I cannot erase one item in the vector during the iterations
        // so how to do that ?
        // used pop_back ?  seems good
        // monkey.items.erase(it);

      }
    }
  }

  int i = 0;
  for (auto a : inspectItems) {
    cout << i++ << " : " << a << endl;
  }
  sort(inspectItems.begin(), inspectItems.end(), greater<int>());
  cout << inspectItems[0] * inspectItems[1] << endl;

  return 0;
}
