
#include <string>
#include <iostream>

extern "C" void test(char* str) {

    std::string s(str);

    std::cout << s << std::endl;
}
