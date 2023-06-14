#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

bool checkIfExternalBracketsOpenAndClose(string str) {

    if (str[0] == '[') {

        int idx = 1;

        for (int i = 1; i < str.length(); i++) {

            if (str[i] == '[') idx++;
            if (str[i] == ']') idx--;

            if (idx == 0) {
                if (i == str.length() - 1) {
                    return true;
                } else return false;
            }
        }
    }
    return false;
}

int getTokenFromList(string str) {

    int idx = 0;
    for (int i = 0; i < str.length(); i++) {

        if (str[i] == '[') idx++;
        if (str[i] == ']') idx--;
        if (str[i] == ',' && idx == 0) {
            return i;
        } 
    }

    return str.length();
}

bool isInTheRightOrder(string left, string right, bool oneValueIsAnInteger = false) {

    int idx = 0;

    if (!checkIfExternalBracketsOpenAndClose(left) || !checkIfExternalBracketsOpenAndClose(right)) {
        // check order
        // split ',' and then check number order

        cout << "checkOrder '" << left << "' '" << right << "'" << endl;

        // while it remains value to left list
        bool rightOrder = false;
        int idxLeft = 0, leftLength = -1;

        while (idxLeft != leftLength){
            idxLeft = getTokenFromList(left);
            leftLength = left.length();

            auto leftValue = left.substr(0, idxLeft);
            left = idxLeft == left.length() ? "" : left.substr(idxLeft + 1);

            int idxRight = getTokenFromList(right);
            auto rightValue = right.substr(0, idxRight);
            right = idxRight == right.length() ? "" : right.substr(idxRight + 1);

            if (leftValue.length() && rightValue.empty()) {
                // Right side ran out of items
                return false;
            }
            if (leftValue.empty() && rightValue.length()) {
                return true;
            }
            if (leftValue.empty() && rightValue.empty()) {
                return false;
            }
            if (oneValueIsAnInteger) {
                if (leftValue >= "0" && leftValue <= "9" && rightValue >= "0" && rightValue <= "9") {
                    return stoi(leftValue) <= stoi(rightValue) ? true : false;
                }
            }

            if (checkIfExternalBracketsOpenAndClose(rightValue) && checkIfExternalBracketsOpenAndClose(leftValue)) {
                rightOrder = isInTheRightOrder(leftValue, rightValue);
            } else if (checkIfExternalBracketsOpenAndClose(rightValue) && !checkIfExternalBracketsOpenAndClose(leftValue)) {
                rightOrder = isInTheRightOrder("[" + leftValue + "]", rightValue, true);
            } else if (!checkIfExternalBracketsOpenAndClose(rightValue) && checkIfExternalBracketsOpenAndClose(leftValue)) {
                rightOrder = isInTheRightOrder(leftValue, "[" + rightValue + "]", true);
            } else {
                cout << "NumOrder : leftValue '" << leftValue << "' rightValue '" << rightValue << "' " << endl;
                rightOrder = stoi(leftValue) <= stoi(rightValue) ? true : false;
            }

            cout << "rightOrder VALUE=" << rightOrder << endl;
            if (rightOrder == false) return false;
        };

        return true;
    }

    if (checkIfExternalBracketsOpenAndClose(left) &&
        checkIfExternalBracketsOpenAndClose(right)) {
        left = left.substr(1, left.length() - 2);
        right = right.substr(1, right.length() - 2);
        return isInTheRightOrder(left, right, oneValueIsAnInteger);
    }

    cout << "ERROR!? '" << left << "' '" << right << "'" << endl;
    return false;

}


int main() {

  ifstream file;
  string line;
  file.open("d13/input");

  string left, right;
  vector<int> indicesInRightOrder;
  int index = 0;

  if (file.is_open()) {
    for (string line; getline(file, line, '\n'); ) {
        if (line.empty()) {

            index++;

            cout << "INPUT '" << left << "' '" << right << "'" << endl;
            
            // run algo
            bool isOrdered = isInTheRightOrder(left, right);
            if (isOrdered) {
                indicesInRightOrder.push_back(index);
            }

            left = "";
            right = "";
            continue;
        }

        right = line;
        if (left.empty()) {
            left = line;
        }

    }
    index++;

    cout << "INPUT '" << left << "' '" << right << "'" << endl;

    // run algo
    bool isOrdered = isInTheRightOrder(left, right);
    if (isOrdered)
    {
        indicesInRightOrder.push_back(index);
    }

    int i = 0;
    for (auto v : indicesInRightOrder) { 
        cout << v << " ";
        i += v;
    }
    cout << endl << "Sum : " << i << endl;

    file.close();
  } else {
    cout << "error to open the file" << endl;
  }

  return 0;
}

