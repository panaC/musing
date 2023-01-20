
#include <string>
#include <iostream>

extern "C" int test(char* str) {

    std::string s(str);

    std::cout << s << " From cgocpp" << std::endl;

    return 43;
}
