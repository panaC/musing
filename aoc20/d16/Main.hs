module Main where

import P1 (part1)
import P2 (part2)

main :: IO ()
main = do
  contents <- getContents

  putStr "Part 1: "
  part1 contents

  putStr "Part 2: "
  part2 contents

