
#include <string>
#include <iostream>

extern "C" int test(char* str) {

    std::string s(str);

    std::cout << s << " From cgocpp" << std::endl;

    return 43;
}

/**
 * 
 * without the " extern "C" "
 * it doens't work seems legit, https://pkg.go.dev/cmd/cgo use ffi binding and need symbol not mangled by compiler
 * 
 * 
 * \# test/cgocpp
/usr/local/go/pkg/tool/darwin_arm64/link: running clang++ failed: exit status 1
Undefined symbols for architecture arm64:
  "_test", referenced from:
      __cgo_ff651e2ec10f_Cfunc_test in 000001.o
     (maybe you meant: __cgo_ff651e2ec10f_Cfunc_test)
ld: symbol(s) not found for architecture arm64
clang: error: linker command failed with exit code 1 (use -v to see invocation)
*/
