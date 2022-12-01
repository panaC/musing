module P2 (part2) where

import qualified Data.IntSet as IntSet
import qualified Data.Set as Set
import qualified Data.List.Split as Split
import qualified Data.Map.Strict as Map
import qualified Debug.Trace as Trace
import qualified Data.List as List

import Common (rulesSet)

import Text.Regex.TDFA

trace' :: Show a => [Char] -> a -> a
trace' name x = Trace.trace (name ++ ": " ++ show x) x

-- "1,2,3,4" -> [1,2,3,4]
parseNearbyLine :: [Char] -> [Int]
parseNearbyLine str =
  let split = Split.splitOn ","
      rd nb = read nb :: Int
  in map rd $ split str

parseNearbyLines :: [[Char]] -> [[Int]]
parseNearbyLines strList = map parseNearbyLine strList

mapSetToSet :: Map.Map String IntSet.IntSet -> IntSet.IntSet
mapSetToSet m = Map.foldl IntSet.union IntSet.empty m

-- return valid nearby from a list of nearby ticket
-- return nearby ticket present in the rules list
-- for each item -> convert nearby to set and check if subset of rules
validNearby :: IntSet.IntSet -> [[Int]] -> [[Int]]
validNearby rulesSet nearbyList = filter isValid nearbyList
  where isValid nearby = (IntSet.fromList nearby) `IntSet.isSubsetOf` rulesSet
  
rulesMap' :: [Char] -> Map.Map String IntSet.IntSet
rulesMap' str = foldl insertMap Map.empty rulesLine
  where rulesLine = trace' "rules lines: " $ lines str
        insertMap set str = Map.insert (classname' str) (rangeSet' str) set
          where classname' str = (Split.splitOn ":" str) !! 0
                rangeSet' str = rulesSet str


transpose :: [[a]]->[[a]]
transpose ([]:_) = []
transpose x = (map head x) : transpose (map tail x)


graphftOnEachPos :: Map.Map String IntSet.IntSet -> [[Int]] -> [Map.Map String IntSet.IntSet]
graphftOnEachPos m posList = map (graphftList m) posList
  where graphftList m l = graphft m $ IntSet.fromList l
          where graphft m s = Map.filter (IntSet.isSubsetOf s) m

-- how to extract the key of map array to array of key array
extractKeyOfMapList :: [Map.Map String IntSet.IntSet] -> [[String]]
extractKeyOfMapList m = map Map.keys m

resolve :: [[String]] -> [[String]]
resolve nm
    | foldr ((&&) . (==1) . length) True nm = nm
    | otherwise = resolve newNm
        where newNm = [if (((==1) . (length)) x) then x else res x  | x <- nm]
              res x = Set.toList $ Set.difference (Set.fromList x) init
              init = Set.fromList $ foldl (++) [] $ filter ((==1) . length) nm

flatten' :: [[String]] -> [String]
flatten' = concat

part2 contents = do
  let lnsSplited = Split.splitOn "\n\n" contents

  putStrLn "DEBUG"

  let myTicket = trace' "my ticket" $ parseNearbyLine $ (lines $ lnsSplited !! 1) !! 1

  let rulesMap = rulesMap' $ lnsSplited !! 0
  putStr "rules: "
  print rulesMap

  let rulesSet = mapSetToSet rulesMap
  print rulesSet

  let lines' = drop 1 $ lines $ lnsSplited !! 2
  print lines'

  let nearbyList = trace' "nearby list: " $ parseNearbyLines lines'
  print nearbyList

  let validNr = validNearby rulesSet nearbyList
  print validNr

  let validNrTranspose = transpose validNr
  print validNrTranspose

  let graph = graphftOnEachPos rulesMap validNrTranspose 
  print graph

  let graphName = extractKeyOfMapList graph
  print graphName

  let graphNameList = map Set.fromList graphName
  print graphNameList

  let res = flatten' $ resolve graphName
  print res

  let resZipped = zip res myTicket
  print resZipped

  let resMap = Map.fromList resZipped
  print resMap

  let resMapDeparture = Map.filterWithKey (\k _ -> List.isPrefixOf "departure" k) resMap
  print resMapDeparture

  let finalRes = foldl (*) 1 $ Map.elems resMapDeparture
  print finalRes
 
  putStrLn "END"

