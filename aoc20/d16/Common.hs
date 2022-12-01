module Common (rulesSet, nbSet) where

import qualified Data.IntSet as IntSet

import Text.Regex.TDFA

numberZipped :: [a] -> [(a,a)]
numberZipped [] = []
numberZipped (x:[]) = []
numberZipped (x:y:xs) = [(x,y)] ++ numberZipped xs

nbSet :: [Char] -> [Int]
nbSet str =
  let numberStr = getAllTextMatches ( str =~ "[0-9]+" )  :: [String]
  in map (\x -> read x :: Int) numberStr


rulesSet :: [Char] -> IntSet.IntSet
rulesSet rules =
  let number = nbSet rules
      numberZip = numberZipped number
      numberRange =  map (\(a, b) -> [a..b]) numberZip
      numberSet = map IntSet.fromList numberRange
  in IntSet.unions numberSet


