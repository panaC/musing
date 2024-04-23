import std/re, std/strutils

for line in stdin.lines:
  let match = findBounds(line,re"((\d) ([a-z]+)(,|;?))+",0)
  echo match

  # not easy to use regexp, matching is simple but not for groups, we have to assign bound value !?