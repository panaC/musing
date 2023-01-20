package main

/*
#cgo LDFLAGS: -L${SRCDIR} -ltestcgocpp
#include <stdlib.h>
#include "test.h"
*/
import "C"

import (
	"fmt"
	"unsafe"
)

func main() {
	fmt.Println("Hello, world.")

	testcgo("Hello, world")
}

func testcgo(str string) {

	// call test from c lib

	cstr := C.CString(str)
	defer C.free(unsafe.Pointer(cstr))

	code := C.test(cstr)

	fmt.Println("Return code ", code)
}

/**

> ./build/bin/cgocpp

Hello, world.
Hello, world From cgocpp
Return code  43


good it works !
*/
