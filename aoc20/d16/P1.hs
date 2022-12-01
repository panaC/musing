module P1 (part1) where

import qualified Data.IntSet as IntSet
import qualified Data.List.Split as Split

import Common (rulesSet, nbSet)

part1 contents = do
  let lnsSplited = Split.splitOn "\n\n" contents
  let rules = rulesSet $ head lnsSplited
  let nearbyTickets = nbSet $ lnsSplited !! 2
  let wrongRules = filter (\x -> IntSet.notMember x rules) nearbyTickets

  -- print $ filter odd $ nbSet $ lnsSplited !! 0
  -- print $ numberZipped . nbSet $ lnsSplited !! 0
  -- print wrongRules
  print $ sum wrongRules

