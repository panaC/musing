package main

import (
  "fmt"

  "github.com/panaC/musing/go/greetings"
)

func main() {
  // Get a greeting message and print it.
  message := greetings.Hello("Gladys")
  fmt.Println(message)
}
