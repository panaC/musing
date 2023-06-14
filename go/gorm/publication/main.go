package main

import (
	"github.com/panac/musing/go/gorm/publication/stor"
)

func main() {

	stor.Init()

	stor.Step()

	stor.Stop()

}
